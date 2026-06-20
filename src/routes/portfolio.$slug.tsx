import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { categoryMeta, projectBySlugQuery, projectsQuery } from "@/lib/queries";

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
    <article>
      {/* Hero */}
      <header
        className="relative min-h-[48vh] md:min-h-[55vh] max-h-[600px] flex items-end overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${cat.color}, var(--color-beret))` }}
      >
        {project.cover_image && (
          <img
            src={project.cover_image as string}
            alt={project.title as string}
            className="absolute inset-0 h-full w-full object-cover opacity-80"
            style={{ objectPosition: (project.cover_position as string) || "50% 50%" }}
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%)" }} />
        <div className="container-x relative pb-10 pt-28 text-white">
          <Link to="/portfolio" className="label-mono opacity-80 hover:opacity-100">
            ← Retour au portfolio
          </Link>
          <div className="label-mono mt-4" style={{ color: "#fff" }}>{cat.emoji} {cat.label}</div>
          <h1 className="text-h1 mt-2" style={{ color: "#fff" }}>{project.title as string}</h1>
        </div>
      </header>

      {/* Meta + description */}
      <section className="container-x py-20 grid lg:grid-cols-3 gap-12">
        <aside className="space-y-6 text-sm">
          {project.client && (
            <div>
              <div className="label-mono text-muted-foreground">Client</div>
              <div className="mt-1">{project.client as string}</div>
            </div>
          )}
          {project.year && (
            <div>
              <div className="label-mono text-muted-foreground">Année</div>
              <div className="mt-1">{project.year as number}</div>
            </div>
          )}
          {Array.isArray(project.tools) && (project.tools as string[]).length > 0 && (
            <div>
              <div className="label-mono text-muted-foreground">Outils</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(project.tools as string[]).map((t) => (
                  <span key={t} className="label-mono rounded-full border px-3 py-1"
                    style={{ borderColor: "var(--color-blue-accent)", color: "var(--color-blue-accent)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
        <div className="lg:col-span-2">
          <p className="text-lg leading-relaxed text-charcoal" style={{ color: "var(--color-charcoal)" }}>
            {(project.description as string) ?? ""}
          </p>
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="container-x pb-24 space-y-6">
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
          <div className="container-x">
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
                    {p.cover_image && <img src={p.cover_image as string} alt={p.title as string} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
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
