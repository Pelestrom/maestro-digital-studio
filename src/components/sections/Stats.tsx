import { useCountUp, useInView } from "@/lib/hooks/useCountUp";

const STATS = [
  { value: 2, suffix: "+", label: "Années\nd'expérience" },
  { value: 100, suffix: "+", label: "Projets\nréalisés" },
  { value: 10, suffix: "+", label: "Clients\naccompagnés" },
  { value: 100, suffix: "%", label: "Satisfaction\nclients" },
] as const;

function Stat({ value, suffix, label }: (typeof STATS)[number]) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const n = useCountUp(value, inView);
  return (
    <div ref={ref} className="text-center">
      <div
        className="font-display"
        style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", color: "var(--color-navy-deep)", lineHeight: 1 }}
      >
        {n}
        <span style={{ color: "var(--color-blue-accent)" }}>{suffix}</span>
      </div>
      <div className="mt-3 label-mono whitespace-pre-line" style={{ color: "var(--color-grey-mid)" }}>
        {label}
      </div>
    </div>
  );
}

export function Stats() {
  return (
    <section style={{ background: "var(--color-grey-soft)" }} className="py-20">
      <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-10">
        {STATS.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}
