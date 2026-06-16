import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { featuredProjectsQuery, categoryMeta } from "@/lib/queries";

export function FeaturedProjects() {
  const { data: projects = [] } = useQuery(featuredProjectsQuery());

  return (
    <section className="py-24 bg-white">
      <div className="container-x">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <div>
            <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>
              Projets sélectionnés
            </div>
            <h2 className="text-h2 mt-4">Travaux récents</h2>
          </div>
          <Link to="/portfolio" className="story-link label-mono" style={{ color: "var(--color-charcoal)" }}>
            Voir tout →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p) => {
            const cat = categoryMeta(p.category as string);
            return (
              <Link
                key={p.id as string}
                to="/portfolio/$slug"
                params={{ slug: p.slug as string }}
                data-cursor="project"
                className="group relative block overflow-hidden rounded-lg border border-border bg-[var(--color-grey-soft)] aspect-[4/3]"
              >
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${cat.color}, var(--color-beret))`,
                  }}
                />
                {p.cover_image && (
                  <img
                    src={p.cover_image as string}
                    alt={p.title as string}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: cat.color }}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white" style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                }}>
                  <div className="label-mono opacity-80">{cat.emoji} {cat.label}</div>
                  <div className="font-display text-2xl mt-1">{p.title as string}</div>
                </div>
              </Link>
            );
          })}
          {projects.length === 0 && (
            <div className="col-span-2 text-center text-sm text-muted-foreground py-16">
              Les projets en vedette apparaîtront ici.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
