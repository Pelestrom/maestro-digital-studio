import { useQuery } from "@tanstack/react-query";
import { testimonialsQuery } from "@/lib/queries";

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

export function TestimonialsCarousel() {
  const { data: items = [] } = useQuery(testimonialsQuery());
  if (items.length === 0) return null;
  const loop = [...items, ...items];
  return (
    <section
      className="py-24 overflow-hidden"
      style={{ background: "#1A1A1A", color: "#fff" }}
    >
      <div className="container-x mb-12">
        <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>Témoignages</div>
        <h2 className="text-h2 mt-4 text-white">Ils m'ont fait confiance.</h2>
      </div>
      <div className="group relative">
        <div
          className="flex gap-6 px-6"
          style={{
            animation: "marquee-x 40s linear infinite",
            width: "max-content",
          }}
        >
          {loop.map((t, i) => (
            <figure
              key={`${t.id}-${i}`}
              className="w-[360px] shrink-0 rounded-lg p-8 border border-white/10"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <Stars n={(t.rating as number) ?? 5} />
              <blockquote className="mt-4 font-display text-xl leading-snug text-white/90">
                "{t.quote as string}"
              </blockquote>
              <figcaption className="mt-6">
                <div className="text-sm font-medium">{t.client_name as string}</div>
                <div className="label-mono text-white/40">{(t.company as string) ?? ""}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <style>{`@keyframes marquee-x { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </section>
  );
}
