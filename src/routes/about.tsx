import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  aboutContentQuery,
  certificationsQuery,
  experienceQuery,
  skillsQuery,
  toolsQuery,
} from "@/lib/queries";
import { useInView } from "@/lib/hooks/useCountUp";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos — Le Maestro du Digital" },
      { name: "description", content: "Designer graphique passionné, je conçois des identités visuelles sophistiquées et stratégiques pour marques ambitieuses." },
      { property: "og:title", content: "À propos — Le Maestro du Digital" },
      { property: "og:description", content: "Designer graphique passionné, identités visuelles premium." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  ssr: false,
  component: AboutPage,
});

function AboutPage() {
  const { data: about } = useQuery(aboutContentQuery());
  const { data: tools = [] } = useQuery(toolsQuery());
  const { data: skills = [] } = useQuery(skillsQuery());
  const { data: certs = [] } = useQuery(certificationsQuery());
  const { data: timeline = [] } = useQuery(experienceQuery());

  return (
    <div className="pt-32">
      {/* Intro */}
      <section className="container-x grid lg:grid-cols-2 gap-12 pb-24">
        <div>
          <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>À propos</div>
          <h1 className="text-hero mt-4">Le Maestro<br/>du Digital.</h1>
          <p className="mt-8 text-base text-muted-foreground leading-relaxed max-w-prose">
            {(about?.biography as string) ??
              "Designer graphique et directeur artistique, je conçois des identités visuelles sophistiquées pour marques ambitieuses."}
          </p>
        </div>
        <div className="relative aspect-[4/5] rounded-lg overflow-hidden" style={{ background: "var(--color-grey-soft)" }}>
          {about?.profile_photo ? (
            <img src={about.profile_photo as string} alt="Le Maestro du Digital" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(160deg, #1B2A4A, #1A1A1A)" }}>
              <div className="text-center text-white/70">
                <div className="font-display text-6xl">M</div>
                <div className="label-mono mt-2">Portrait à venir</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Values */}
      <section className="py-20" style={{ background: "var(--color-grey-soft)" }}>
        <div className="container-x grid md:grid-cols-3 gap-8">
          {[
            { label: "Précision", text: "Chaque détail compte. Du pixel à la grille typographique." },
            { label: "Créativité", text: "Une signature visuelle distinctive pour chaque projet." },
            { label: "Impact", text: "Du design qui sert la stratégie et marque les esprits." },
          ].map((v) => (
            <div key={v.label}>
              <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>{v.label}</div>
              <p className="mt-3 text-sm text-charcoal" style={{ color: "var(--color-charcoal)" }}>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      {timeline.length > 0 && (
        <section className="container-x py-24">
          <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>Parcours</div>
          <h2 className="text-h2 mt-4 mb-12">Mon expérience</h2>
          <ol className="relative border-l-2 pl-8 space-y-10" style={{ borderColor: "var(--color-blue-accent)" }}>
            {timeline.map((e) => (
              <li key={e.id as string} className="relative">
                <span className="absolute -left-[37px] top-1 w-3 h-3 rotate-45" style={{ background: "var(--color-blue-accent)" }} />
                <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>{e.year as string}</div>
                <div className="font-display text-xl mt-1">{e.role as string}</div>
                {e.company && <div className="text-sm text-muted-foreground">{e.company as string}</div>}
                {e.description && <p className="text-sm mt-2 text-charcoal max-w-prose" style={{ color: "var(--color-charcoal)" }}>{e.description as string}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Tools */}
      <section className="py-24" style={{ background: "var(--color-grey-soft)" }}>
        <div className="container-x">
          <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>Outils</div>
          <h2 className="text-h2 mt-4 mb-12">Mes outils</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tools.map((t) => (
              <ToolCard key={t.id as string} tool={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      {skills.length > 0 && (
        <section className="container-x py-24">
          <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>Compétences</div>
          <h2 className="text-h2 mt-4 mb-12">Mes compétences</h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            {skills.map((s) => (
              <SkillBar key={s.id as string} name={s.name as string} level={s.level as number} />
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certs.length > 0 && (
        <section className="py-20" style={{ background: "var(--color-grey-soft)" }}>
          <div className="container-x">
            <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>Certifications</div>
            <h2 className="text-h2 mt-4 mb-10">Diplômes</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {certs.map((c) => (
                <div key={c.id as string} className="bg-white border border-border rounded-lg p-6">
                  <div className="font-display text-lg">{c.name as string}</div>
                  <div className="label-mono text-muted-foreground mt-2">{c.issuer as string} · {c.year as number}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 text-center" style={{ background: "#1A1A1A", color: "#fff" }}>
        <div className="container-x">
          <h2 className="text-h2" style={{ color: "#fff" }}>Travaillons ensemble.</h2>
          <p className="mt-4 text-white/60 max-w-md mx-auto">
            Une idée, un projet, une marque à révéler ? Discutons-en.
          </p>
          <Link
            to="/contact"
            data-cursor="cta"
            className="inline-flex mt-8 items-center gap-2 rounded-full px-6 py-3 text-sm label-mono"
            style={{ background: "var(--color-blue-accent)", color: "#fff" }}
          >
            Me contacter →
          </Link>
        </div>
      </section>
    </div>
  );
}

function ToolCard({ tool }: { tool: any }) {
  return (
    <div
      className="hover-lift group bg-white border border-border rounded-lg p-8 relative overflow-hidden"
      style={{ "--brand": tool.brand_color || "#3B6FCC" } as React.CSSProperties}
    >
      <span
        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: tool.brand_color || "var(--color-blue-accent)" }}
      />
      <div
        className="w-14 h-14 rounded-[10px] flex items-center justify-center overflow-hidden"
        style={{ background: "var(--color-grey-soft)" }}
      >
        {tool.icon_url ? (
          <img
            src={tool.icon_url}
            alt={`${tool.name} logo`}
            className="w-10 h-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          />
        ) : (
          <div className="font-display text-2xl" style={{ color: tool.brand_color }}>{(tool.name as string).slice(0, 2)}</div>
        )}
      </div>
      <h3 className="font-display text-2xl mt-6 transition-colors" style={{}}>
        {tool.name as string}
      </h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{tool.description as string}</p>
    </div>
  );
}

function SkillBar({ name, level }: { name: string; level: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref}>
      <div className="flex items-baseline justify-between">
        <span className="text-sm">{name}</span>
        <span className="label-mono" style={{ color: "var(--color-blue-accent)" }}>{level}%</span>
      </div>
      <div className="mt-2 h-[3px] w-full" style={{ background: "var(--color-grey-soft)" }}>
        <div
          className="h-full"
          style={{
            background: "var(--color-blue-accent)",
            width: inView ? `${level}%` : "0%",
            transition: "width 1s cubic-bezier(.22,1,.36,1)",
          }}
        />
      </div>
    </div>
  );
}
