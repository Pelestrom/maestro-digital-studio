import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

export const ContactSchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(120),
  email: z.string().trim().email("Email invalide").max(255),
  projectType: z.string().trim().min(1).max(80),
  message: z.string().trim().min(10, "Message trop court").max(4000),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/, "Numéro WhatsApp invalide (format international)")
    .max(20),
  countryCode: z.string().trim().min(2).max(3),
  sourcePage: z.string().trim().max(200).optional(),
});

export type ContactInput = z.infer<typeof ContactSchema>;

const MD_LOGO_URL =
  "https://0b26a37d-72c6-4400-bd72-53489dab6ea2.lovableproject.com/__l5e/assets-v1/d335028f-d740-4735-b18b-c95b1fb8b338/md-logo.png";

// Naive in-memory rate limiter (per worker instance). Best-effort anti-spam.
const RATE = new Map<string, { count: number; reset: number }>();
function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const rec = RATE.get(key);
  if (!rec || rec.reset < now) {
    RATE.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (rec.count >= limit) return false;
  rec.count += 1;
  return true;
}

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ContactSchema.parse(input))
  .handler(async ({ data }) => {
    // Capture IP & rate-limit
    let ip = "";
    try {
      ip =
        getRequestHeader("cf-connecting-ip") ||
        getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
        getRequestHeader("x-real-ip") ||
        "";
    } catch {
      ip = "";
    }
    const rlKey = ip || data.email.toLowerCase();
    if (!rateLimit(rlKey)) {
      throw new Error("Trop de tentatives. Veuillez réessayer dans une minute.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error: insertError } = await supabaseAdmin
      .from("messages" as any)
      .insert({
        name: data.name,
        email: data.email,
        project_type: data.projectType,
        message: data.message,
        whatsapp: data.whatsapp,
        country_code: data.countryCode,
        source_page: data.sourcePage || null,
        ip_address: ip || null,
        status: "new",
      });

    if (insertError) {
      console.error("[contact] insert failed", insertError);
      throw new Error("Impossible d'enregistrer votre message.");
    }

    // Best-effort emails via Resend connector
    const lovableKey = process.env.LOVABLE_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    let emailSent = false;

    if (lovableKey && resendKey) {
      try {
        const designerEmail = "le.maestro.du.digital@gmail.com";
        const firstName = data.name.split(" ")[0];
        const portfolioUrl = "https://le-maestro-du-digital.lovable.app";

        await fetch("https://connector-gateway.lovable.dev/resend/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": resendKey,
          },
          body: JSON.stringify({
            from: "Le Maestro Portfolio <onboarding@resend.dev>",
            to: [designerEmail],
            reply_to: data.email,
            subject: `Nouveau message de ${data.name} — Le Maestro Portfolio`,
            html: notificationHtml(data, ip),
          }),
        });

        await fetch("https://connector-gateway.lovable.dev/resend/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": resendKey,
          },
          body: JSON.stringify({
            from: "Le Maestro du Digital <onboarding@resend.dev>",
            to: [data.email],
            subject: "Merci pour votre message — Le Maestro du Digital",
            html: autoReplyHtml(firstName, portfolioUrl),
          }),
        });
        emailSent = true;
      } catch (e) {
        console.error("[contact] resend send failed", e);
      }
    }

    // WhatsApp Business auto-reply (best-effort via Twilio connector if configured)
    const twilioKey = process.env.TWILIO_API_KEY;
    const twilioFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g. "whatsapp:+14155238886"
    let whatsappSent = false;
    if (lovableKey && twilioKey && twilioFrom) {
      try {
        const body = `Bonjour ${data.name.split(" ")[0]},\n\nMerci pour votre message et l'intérêt porté à mes services. Votre demande a bien été reçue. Je reviendrai vers vous très prochainement afin d'échanger sur votre projet.\n\nÀ bientôt,\nLe Maestro du Digital`;
        const params = new URLSearchParams({
          To: `whatsapp:${data.whatsapp}`,
          From: twilioFrom,
          Body: body,
        });
        const r = await fetch("https://connector-gateway.lovable.dev/twilio/Messages.json", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": twilioKey,
          },
          body: params.toString(),
        });
        whatsappSent = r.ok;
        if (!r.ok) console.error("[contact] twilio whatsapp failed", await r.text());
      } catch (e) {
        console.error("[contact] twilio whatsapp failed", e);
      }
    }

    return { ok: true, emailSent, whatsappSent };
  });

function notificationHtml(d: ContactInput, ip: string) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f7f9fc;padding:24px;color:#2C2C35">
    <div style="max-width:600px;margin:auto;background:#fff;border:1px solid #e2e2e6;border-radius:12px;overflow:hidden">
      <div style="background:#0A1628;color:#fff;padding:24px;text-align:center">
        <img src="${MD_LOGO_URL}" alt="MD" width="80" style="display:block;margin:0 auto 8px"/>
        <div style="font-family:Georgia,serif;font-size:18px;letter-spacing:2px">LE MAESTRO DU DIGITAL</div>
      </div>
      <div style="padding:28px">
        <h2 style="margin:0 0 16px;color:#3B6FCC">Nouveau message</h2>
        <p><strong>Nom :</strong> ${esc(d.name)}</p>
        <p><strong>Email :</strong> <a href="mailto:${esc(d.email)}" style="color:#3B6FCC">${esc(d.email)}</a></p>
        <p><strong>WhatsApp :</strong> <a href="https://wa.me/${esc(d.whatsapp.replace(/\D/g, ""))}" style="color:#3B6FCC">${esc(d.whatsapp)}</a></p>
        <p><strong>Type de projet :</strong> ${esc(d.projectType)}</p>
        ${d.sourcePage ? `<p><strong>Source :</strong> ${esc(d.sourcePage)}</p>` : ""}
        ${ip ? `<p style="color:#999;font-size:12px"><strong>IP :</strong> ${esc(ip)}</p>` : ""}
        <hr style="border:none;border-top:1px solid #e2e2e6;margin:16px 0"/>
        <p style="white-space:pre-wrap;line-height:1.6">${esc(d.message)}</p>
      </div>
    </div></body></html>`;
}

function autoReplyHtml(firstName: string, url: string) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f7f9fc;padding:24px;color:#2C2C35;margin:0">
    <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e2e6">
      <div style="background:#0A1628;padding:36px 24px;text-align:center">
        <img src="${MD_LOGO_URL}" alt="Le Maestro du Digital" width="120" style="display:block;margin:0 auto"/>
      </div>
      <div style="padding:32px 28px">
        <p style="margin:0 0 16px;font-size:16px">Bonjour ${esc(firstName)},</p>
        <p style="line-height:1.7">Merci d'avoir pris le temps de me contacter.</p>
        <p style="line-height:1.7">Votre demande a bien été reçue et sera examinée avec attention. Je reviendrai vers vous dans les meilleurs délais afin d'échanger sur votre projet et vos besoins.</p>
        <p style="line-height:1.7">En attendant, je vous remercie pour votre confiance.</p>
        <p style="margin:24px 0 0;line-height:1.7">Cordialement,<br/><strong>Le Maestro du Digital</strong></p>
        <div style="text-align:center;margin:28px 0">
          <a href="${url}/portfolio" style="display:inline-block;background:#3B6FCC;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:13px;letter-spacing:1px">VOIR LE PORTFOLIO</a>
        </div>
      </div>
      <div style="background:#0A1628;color:#9CB0CC;padding:20px 28px;font-size:12px;line-height:1.7;text-align:center">
        <div style="font-family:Georgia,serif;font-size:14px;letter-spacing:2px;color:#fff;margin-bottom:6px">LE MAESTRO DU DIGITAL</div>
        Graphic Designer &amp; Directeur Artistique<br/>
        <a href="mailto:le.maestro.du.digital@gmail.com" style="color:#7BA7DC">le.maestro.du.digital@gmail.com</a> · 
        <a href="https://wa.me/2120777657432" style="color:#7BA7DC">WhatsApp +212 0777657432</a>
      </div>
    </div></body></html>`;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
