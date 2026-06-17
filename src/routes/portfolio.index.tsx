import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3 } from "lucide-react";
import { CATEGORIES, categoryMeta, projectsQuery } from "@/lib/queries";
import { CategorySelect, CATEGORY_ICONS, type CategoryOption } from "@/components/ui/CategorySelect";

export const Route = createFileRoute("/portfolio/")({
  head: () => ({
    meta: [
      { title: "Portfolio — Le Maestro du Digital" },
      { name: "description", content: "Tous les projets sélectionnés : branding, social media, print, UI, présentation, retouche photo." },
      { property: "og:title", content: "Portfolio — Le Maestro du Digital" },
      { property: "og:description", content: "Projets de design réalisés par Le Maestro du Digital." },
      { property: "og:url", content: "/portfolio" },
    ],
    links: [{ rel: "canonical", href: "/portfolio" }],
  }),
  ssr: false,
  component: PortfolioIndex,
});

const FILTER_OPTIONS: CategoryOption[] = [
  { value: "all", label: "Toutes les catégories", icon: "Grid3X3" },
  ...CATEGORIES.map((c) => ({ value: c.slug, label: c.label, icon: c.icon })),
];

function PortfolioIndex() {
  const { data: projects = [] } = useQuery(projectsQuery());
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(
    () => (active === "all" ? projects : projects.filter((p) => p.category === active)),
    [projects, active],
  );

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="container-x">
        <div className="max-w-2xl mb-12">
          <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>
            Portfolio
          </div>
          <h1 className="text-hero mt-4">Projets.</h1>
          <p className="mt-6 text-base text-muted-foreground">
            Sélection de réalisations en branding, social media, print, UI, présentation et retouche photo.
          </p>
        </div>

        <div className="sticky top-16 z-30 -mx-6 px-6 py-4 mb-10 bg-white/85 backdrop-blur border-b border-border">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-full sm:w-auto sm:min-w-[280px]">
              <CategorySelect
                value={active}
                onChange={setActive}
                options={FILTER_OPTIONS}
                ariaLabel="Filtrer par catégorie"
              />
            </div>
            <span className="ml-auto label-mono" style={{ color: "var(--color-blue-accent)" }}>
              {filtered.length} projet{filtered.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => {
              const cat = categoryMeta(p.category as string);
              const Icon = CATEGORY_ICONS[cat.icon] ?? Grid3X3;
              return (
                <motion.div
                  key={p.id as string}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to="/portfolio/$slug"
                    params={{ slug: p.slug as string }}
                    data-cursor="project"
                    className="group relative block overflow-hidden rounded-lg border border-border bg-[var(--color-grey-soft)] aspect-[4/5]"
                  >
                    <div
                      className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                      style={{ background: `linear-gradient(160deg, ${cat.color}, var(--color-beret))` }}
                    />
                    {p.cover_image && (
                      <img
                        src={p.cover_image as string}
                        alt={p.title as string}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: cat.color }} />
                    <div
                      className="absolute inset-0 flex flex-col justify-end p-5 text-white"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)" }}
                    >
                      <div className="label-mono opacity-80 inline-flex items-center gap-1.5">
                        <Icon size={14} />
                        <span>{cat.label}</span>
                      </div>
                      <div className="font-display text-xl mt-1">{p.title as string}</div>
                      {p.client && (
                        <div className="text-xs text-white/70 mt-1">{p.client as string} {p.year ? `· ${p.year}` : ""}</div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-24">
            Aucun projet dans cette catégorie pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
