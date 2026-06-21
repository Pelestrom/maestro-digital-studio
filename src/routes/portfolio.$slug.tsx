import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { categoryMeta, projectBySlugQuery, projectsQuery } from "@/lib/queries";
import { ToolBadge } from "@/components/ui/ToolIcon";

export const Route = createFileRoute("/portfolio/$slug")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Le Maestro du Digital` },
      { property: "og:title", content: `${params.slug} — Le Maestro du Digital` },
    ],
    links: [{ rel: "canonical", href: `/portfolio/${params.slug}` }],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>404</div>
        <h1 className="text-h2 mt-4">Projet introuvable</h1>
        <Link to="/portfolio" className="story-link mt-6 inline-block">Retour au portfolio</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-h2">Erreur</h1>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        <button onClick={reset} className="mt-6 story-link">Réessayer</button>
      </div>
    </div>
  ),
  component: ProjectPage,
});

function ProjectPage() {
  const { slug } = Route.useParams();
  const projectQ = useQuery(projectBySlugQuery(slug));
  const project = projectQ.data;
  const { data: all = [] } = useQuery(projectsQuery());
  if (projectQ.isLoading) return <div className="min-h-screen" />;
  if (!project) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>404</div>
        <h1 className="text-h2 mt-4">Projet introuvable</h1>
        <Link to="/portfolio" className="story-link mt-6 inline-block">Retour au portfolio</Link>
      </div>
    </div>
  );

  const cat = categoryMeta(project.category as string);
  const related = all
    .filter((p) => p.category === project.category && p.id !== project.id)
    .slice(0, 3);

  const gallery: string[] = Array.isArray(project.gallery_images) ? (project.gallery_images as string[]) : [];

  return (
    <article className="pt-24 bg-white">
      {/* Sticky top bar — opaque, never overlaps image */}
      <div
        className="sticky top-20 z-30 border-b backdrop-blur-md"
        style={{ background: "rgba(255,255,255,0.92)", borderColor: "var(--color-border)" }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-3 flex items-center gap-4">
          <Link
            to="/portfolio"
            className="label-mono text-xs hover:opacity-70 transition-opacity"
            style={{ color: "var(--color-charcoal)" }}
          >
            ← Retour au portfolio
          </Link>
          <span
            className="label-mono text-[10px] px-2.5 py-1 rounded-full"
            style={{ background: cat.color, color: "#fff" }}
          >
            {cat.emoji} {cat.label}
          </span>
        </div>
      </div>

      {/* Two-column main section */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          {/* Left: cover image */}
          <div
            className="relative w-full rounded-xl overflow-hidden lg:sticky lg:top-36"
            style={{
              background: `linear-gradient(160deg, ${cat.color}, var(--color-beret))`,
              aspectRatio: "4 / 5",
              maxHeight: "70vh",
            }}
          >
            {project.cover_image && (
              <img
                src={project.cover_image as string}
                alt={project.title as string}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: (project.cover_position as string) || "50% 50%" }}
              />
            )}
          </div>

          {/* Right: meta + description */}
          <div>
            <h1 className="text-h1 leading-tight" style={{ color: "var(--color-navy, #1B2A4A)" }}>
              {project.title as string}
            </h1>

            <div className="mt-8 grid grid-cols-2 gap-6 pb-8 border-b" style={{ borderColor: "var(--color-border)" }}>
              {project.client && (
                <div>
                  <div className="label-mono text-xs text-muted-foreground">Client</div>
                  <div className="mt-1 text-sm" style={{ color: "var(--color-charcoal)" }}>{project.client as string}</div>
                </div>
              )}
              {project.year && (
                <div>
                  <div className="label-mono text-xs text-muted-foreground">Année</div>
                  <div className="mt-1 text-sm" style={{ color: "var(--color-charcoal)" }}>{project.year as number}</div>
                </div>
              )}
            </div>

            <p className="mt-8 text-base leading-relaxed" style={{ color: "var(--color-charcoal)" }}>
              {(project.description as string) ?? ""}
            </p>

            {Array.isArray(project.tools) && (project.tools as string[]).length > 0 && (
              <div className="mt-10">
                <div className="label-mono text-xs text-muted-foreground mb-3">Outils utilisés</div>
                <div className="flex flex-wrap gap-3">
                  {(project.tools as string[]).map((t) => (
                    <ToolBadge key={t} name={t} size={36} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-24 space-y-6">
          <div className="label-mono text-xs" style={{ color: "var(--color-blue-accent)" }}>Galerie</div>
          {gallery.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${project.title} — visuel ${i + 1}`}
              className="w-full max-h-[70vh] object-contain rounded-lg mx-auto bg-black/5"
              loading="lazy"
            />
          ))}
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="py-20" style={{ background: "var(--color-grey-soft)" }}>
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>Projets similaires</div>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {related.map((p) => {
                const c = categoryMeta(p.category as string);
                return (
                  <Link
                    key={p.id as string}
                    to="/portfolio/$slug"
                    params={{ slug: p.slug as string }}
                    data-cursor="project"
                    className="group relative block overflow-hidden rounded-lg aspect-[4/5]"
                    style={{ background: `linear-gradient(160deg, ${c.color}, var(--color-beret))` }}
                  >
                    {p.cover_image && <img src={p.cover_image as string} alt={p.title as string} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: (p.cover_position as string) || "50% 50%" }} />}
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white" style={{ background: "linear-gradient(to top, rgba(0,0,0,.7), transparent)" }}>
                      <div className="label-mono opacity-80">{c.emoji} {c.label}</div>
                      <div className="font-display text-lg mt-1">{p.title as string}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
