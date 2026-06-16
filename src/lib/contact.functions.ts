import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const ContactSchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(120),
  email: z.string().trim().email("Email invalide").max(255),
  projectType: z.string().trim().min(1).max(80),
  message: z.string().trim().min(10, "Message trop court").max(4000),
});

export type ContactInput = z.infer<typeof ContactSchema>;

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ContactSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Save the message (always, even if email fails)
    const { error: insertError } = await supabaseAdmin
      .from("messages" as any)
      .insert({
        name: data.name,
        email: data.email,
        project_type: data.projectType,
        message: data.message,
      });

    if (insertError) {
      console.error("[contact] insert failed", insertError);
      throw new Error("Impossible d'enregistrer votre message.");
    }

    // Try to send emails via Resend connector gateway (best-effort).
    const lovableKey = process.env.LOVABLE_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    let emailSent = false;

    if (lovableKey && resendKey) {
      try {
        const designerEmail = "le.maestro.du.digital@gmail.com";
        const firstName = data.name.split(" ")[0];
        const portfolioUrl = "https://le-maestro-du-digital.lovable.app";

        // Notification to designer
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
            html: notificationHtml(data),
          }),
        });

        // Bilingual auto-reply to sender
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
            subject: "Merci / Thank you — Le Maestro du Digital",
            html: autoReplyHtml(firstName, portfolioUrl),
          }),
        });
        emailSent = true;
      } catch (e) {
        console.error("[contact] resend send failed", e);
      }
    }

    return { ok: true, emailSent };
  });

function notificationHtml(d: ContactInput) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f7f9fc;padding:24px;color:#2C2C35">
    <div style="max-width:600px;margin:auto;background:#fff;border:1px solid #e2e2e6">
      <div style="background:#1A1A1A;color:#fff;padding:24px;font-family:Georgia,serif;font-size:22px">Le Maestro du Digital</div>
      <div style="padding:24px">
        <h2 style="margin:0 0 16px;color:#3B6FCC">Nouveau message</h2>
        <p><strong>Nom :</strong> ${esc(d.name)}</p>
        <p><strong>Email :</strong> <a href="mailto:${esc(d.email)}" style="color:#3B6FCC">${esc(d.email)}</a></p>
        <p><strong>Type de projet :</strong> ${esc(d.projectType)}</p>
        <hr style="border:none;border-top:1px solid #e2e2e6;margin:16px 0"/>
        <p style="white-space:pre-wrap;line-height:1.6">${esc(d.message)}</p>
      </div>
    </div></body></html>`;
}

function autoReplyHtml(firstName: string, url: string) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f7f9fc;padding:24px;color:#2C2C35">
    <div style="max-width:600px;margin:auto;border:1px solid #e2e2e6">
      <div style="background:#1A1A1A;color:#fff;padding:32px 24px;font-family:Georgia,serif;font-size:26px;text-align:center">Le Maestro du Digital</div>
      <div style="background:#FFFFFF;padding:28px 28px 20px">
        <p style="margin-top:0">Bonjour ${esc(firstName)},</p>
        <p>Merci pour votre message ! Je l'ai bien reçu et je vous répondrai dans les plus brefs délais, généralement sous 24 à 48h.</p>
        <p>En attendant, n'hésitez pas à explorer mon portfolio : <a href="${url}" style="color:#3B6FCC">${url}</a></p>
        <p>À très bientôt,</p>
      </div>
      <div style="text-align:center;padding:14px 0;color:#3B6FCC;font-size:18px;border-top:1px solid #3B6FCC;border-bottom:1px solid #3B6FCC">✦</div>
      <div style="background:#F7F9FC;padding:20px 28px">
        <p style="margin-top:0">Hello ${esc(firstName)},</p>
        <p>Thank you for your message! I have received it and will get back to you as soon as possible, usually within 24 to 48 hours.</p>
        <p>In the meantime, feel free to explore my portfolio: <a href="${url}" style="color:#3B6FCC">${url}</a></p>
        <p>Talk soon,</p>
      </div>
      <div style="background:#1A1A1A;color:#fff;padding:20px 28px;font-size:13px;line-height:1.6">
        <div style="font-family:Georgia,serif;font-size:18px;margin-bottom:6px">LE MAESTRO DU DIGITAL</div>
        Graphic Designer &amp; Art Director<br/>
        📧 le.maestro.du.digital@gmail.com<br/>
        💬 WhatsApp : +212 0777657432<br/>
        🌐 <a href="${url}" style="color:#7BA7DC">${url}</a>
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
