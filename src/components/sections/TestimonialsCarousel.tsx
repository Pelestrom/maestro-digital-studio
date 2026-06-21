function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-1" aria-label={`${n} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < n ? "var(--color-blue-accent)" : "rgba(255,255,255,0.2)" }}>
          ★
        </span>
      ))}
    </div>
  );
}

const TESTIMONIALS = [
  {
    quote:
      "Il a vraiment l'œil du designer. Le souci du détail et l'excellence dans l'exécution font de lui un excellent designer graphique.",
    name: "Koffi Mathieu Junior",
    role: "CEO, ElectroCenter",
    rating: 5,
  },
  {
    quote:
      "Des délais respectés et une qualité au rendez-vous à chaque fois. Exactement ce qu'on attend d'un partenaire créatif.",
    name: "Soro Aminata",
    role: "Gérante, DDS-CI Distribution",
    rating: 5,
  },
  {
    quote: "Un niveau de compétence impressionnant pour son âge. Un vrai talent à suivre.",
    name: "Dr. Safae Elotmani",
    role: "Responsable de l'incubateur CIEL, HESTIM Engineering & Business School",
    rating: 5,
  },
];

export function TestimonialsCarousel() {
  return (
    <section className="py-24" style={{ background: "#1A1A1A", color: "#fff" }}>
      <div className="container-x">
        <div className="mb-12">
          <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>Témoignages</div>
          <h2 className="text-h2 mt-4 text-white">Ils m'ont fait confiance.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="rounded-lg p-8 border border-white/10 flex flex-col"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <Stars n={t.rating} />
              <blockquote className="mt-4 font-display text-xl leading-snug text-white/90 flex-1">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6">
                <div className="text-sm font-medium">{t.name}</div>
                <div className="label-mono text-white/40 text-[11px]">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
