import { Link } from "@tanstack/react-router";

const SERVICES = [
  {
    title: "Identité Visuelle & Branding",
    text: "Création de logos, chartes graphiques et systèmes visuels cohérents qui donnent à votre marque une identité forte et mémorable.",
    icon: (
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M16 3 L29 16 L16 29 L3 16 Z" />
        <circle cx="16" cy="16" r="4" />
      </svg>
    ),
  },
  {
    title: "Design Réseaux Sociaux",
    text: "Conception de visuels percutants pour Instagram, Facebook, LinkedIn et autres plateformes — posts, stories, couvertures, templates.",
    icon: (
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="4" y="4" width="9" height="9" />
        <rect x="19" y="4" width="9" height="9" />
        <rect x="4" y="19" width="9" height="9" />
        <rect x="19" y="19" width="9" height="9" />
      </svg>
    ),
  },
  {
    title: "UI/UX Design & Interfaces",
    text: "Maquettes et prototypes d'interfaces web et mobile, pensés pour l'expérience utilisateur et l'esthétique visuelle premium.",
    icon: (
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="3" y="5" width="26" height="18" rx="2" />
        <path d="M3 11 L29 11" />
        <circle cx="7" cy="8" r="0.8" />
      </svg>
    ),
  },
];

export function Services() {
  return (
    <section className="py-24" style={{ background: "var(--color-grey-soft)" }}>
      <div className="container-x">
        <div className="max-w-xl mb-14">
          <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>Services</div>
          <h2 className="text-h2 mt-4">Ce que je conçois.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="hover-lift group relative rounded-lg bg-white p-8 pb-10 border border-border flex flex-col"
            >
              <span
                className="absolute top-0 left-0 right-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "var(--color-blue-accent)" }}
              />
              <div style={{ color: "var(--color-blue-accent)" }}>{s.icon}</div>
              <h3 className="font-display text-xl mt-6">{s.title}</h3>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed flex-1">{s.text}</p>
              <div
                className="mt-8 pt-5 border-t flex items-center justify-between"
                style={{ borderColor: "var(--color-border)" }}
              >
                <Link
                  to="/contact"
                  className="label-mono text-xs story-link"
                  style={{ color: "var(--color-blue-accent)" }}
                >
                  En savoir plus →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
