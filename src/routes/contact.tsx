import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitContact, ContactSchema, type ContactInput } from "@/lib/contact.functions";
import { CATEGORIES } from "@/lib/queries";
import { CategorySelect, type CategoryOption } from "@/components/ui/CategorySelect";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Le Maestro du Digital" },
      { name: "description", content: "Discutons de votre projet : branding, social media, print, UI ou retouche photo. Réponse sous 24-48h." },
      { property: "og:title", content: "Contact — Le Maestro du Digital" },
      { property: "og:description", content: "Discutons de votre projet design." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

type FormState = "idle" | "loading" | "success" | "error";

const PROJECT_TYPES: CategoryOption[] = [
  ...CATEGORIES.map((c) => ({ value: c.label, label: c.label, icon: c.icon })),
  { value: "Autre", label: "Autre", icon: "Grid3X3" },
];


function ContactPage() {
  const send = useServerFn(submitContact);
  const [form, setForm] = useState<ContactInput>({ name: "", email: "", projectType: PROJECT_TYPES[0].value, message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactInput, string>>>({});
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const onChange = (k: keyof ContactInput, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = ContactSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ContactInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof ContactInput;
        if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setState("loading");
    setErrorMsg("");
    try {
      await send({ data: parsed.data });
      setState("success");
      setForm({ name: "", email: "", projectType: PROJECT_TYPES[0].value, message: "" });
    } catch (err: any) {
      console.error(err);
      setState("error");
      setErrorMsg(err?.message ?? "Une erreur est survenue.");
    }
  };

  return (
    <div className="pt-16 grid lg:grid-cols-5 min-h-screen">
      {/* Left */}
      <aside
        className="lg:col-span-2 px-6 md:px-12 py-20"
        style={{ background: "#1A1A1A", color: "#fff" }}
      >
        <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>Contact</div>
        <h1 className="text-hero mt-4" style={{ color: "#fff" }}>
          Parlons de votre projet.
        </h1>
        <p className="mt-6 text-white/60 max-w-sm">
          Une idée, une marque à révéler, un visuel à concevoir ? Écrivez-moi.
        </p>
        <div className="mt-12 space-y-6 text-sm">
          <div>
            <div className="label-mono text-white/40">Email</div>
            <a href="mailto:le.maestro.du.digital@gmail.com" className="story-link mt-1 inline-block">
              le.maestro.du.digital@gmail.com
            </a>
          </div>
          <div>
            <div className="label-mono text-white/40">WhatsApp</div>
            <a
              href="https://wa.me/2120777657432?text=Bonjour%20Le%20Maestro%20!%20J%27aimerais%20parler%20d%27un%20projet."
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="beret"
              className="story-link mt-1 inline-block"
            >
              +212 0777657432
            </a>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/80">Disponible pour missions freelance</span>
          </div>
        </div>
      </aside>

      {/* Right */}
      <section className="lg:col-span-3 px-6 md:px-12 py-20 bg-white">
        {state === "success" ? (
          <div className="max-w-md mx-auto text-center py-24">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl text-white" style={{ background: "var(--color-blue-accent)" }}>
              ✓
            </div>
            <h2 className="text-h2 mt-6">Message envoyé !</h2>
            <p className="text-muted-foreground mt-3">
              Merci. Je vous répondrai dans les plus brefs délais (24–48h).
            </p>
            <button
              onClick={() => setState("idle")}
              className="mt-8 story-link label-mono"
            >
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="max-w-xl mx-auto space-y-6" noValidate>
            <Field label="Nom complet" error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                className={inputCls}
                autoComplete="name"
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                className={inputCls}
                autoComplete="email"
              />
            </Field>
            <Field label="Type de projet" error={errors.projectType}>
              <div className="mt-2">
                <CategorySelect
                  value={form.projectType}
                  onChange={(v) => onChange("projectType", v)}
                  options={PROJECT_TYPES}
                  ariaLabel="Type de projet"
                />
              </div>
            </Field>

            <Field label="Message" error={errors.message}>
              <textarea
                value={form.message}
                onChange={(e) => onChange("message", e.target.value)}
                rows={6}
                className={inputCls + " min-h-[160px] resize-y"}
              />
            </Field>

            {state === "error" && (
              <div className="text-sm" style={{ color: "var(--color-destructive)" }}>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              data-cursor="cta"
              disabled={state === "loading"}
              className="w-full rounded-full py-3 label-mono text-white transition-opacity"
              style={{
                background: "var(--color-blue-accent)",
                opacity: state === "loading" ? 0.6 : 1,
              }}
            >
              {state === "loading" ? "Envoi…" : "Envoyer le message →"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

const inputCls =
  "w-full bg-transparent border-0 border-b border-border focus:outline-none focus:border-[var(--color-blue-accent)] py-3 text-base placeholder:text-muted-foreground transition-colors";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-mono text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <div className="mt-1 text-xs" style={{ color: "var(--color-destructive)" }}>{error}</div>}
    </label>
  );
}
