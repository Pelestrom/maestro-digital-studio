import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Grid3x2 as Grid3X3 } from "lucide-react";
import { CATEGORIES, categoryMeta, projectsQuery } from "@/lib/queries";
import { CATEGORY_ICONS } from "@/components/ui/CategorySelect";
import { FolderIcon } from "@/components/portfolio/FolderIcon";
import { ScrollFadeSection } from "@/components/scroll/ScrollFadeSection";

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

type FolderDef = {
  slug: string;
  label: string;
  icon: string;
  color: string;
};

const ALL_FOLDER: FolderDef = {
  slug: "all",
  label: "Tous les projets",
  icon: "Grid3X3",
  color: "#0F172A",
};

const FOLDERS: FolderDef[] = [
  ALL_FOLDER,
  ...CATEGORIES.map((c) => ({ slug: c.slug, label: c.label, icon: c.icon, color: c.color })),
];

const EASE = [0.22, 1, 0.36, 1] as const;

function PortfolioIndex() {
  const { data: projects = [] } = useQuery(projectsQuery());
  const [active, setActive] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: projects.length };
    for (const p of projects) {
      const key = p.category as string;
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [projects]);

  const filtered = useMemo(() => {
    if (!active) return [];
    return active === "all" ? projects : projects.filter((p) => p.category === active);
  }, [projects, active]);

  const activeFolder = active ? FOLDERS.find((f) => f.slug === active) : null;

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <ScrollFadeSection>
        <div className="container-x">
          <div className="max-w-2xl mb-10">
            <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>
              Portfolio
            </div>
            <h1 className="text-hero mt-4">Projets.</h1>
            <p className="mt-6 text-base text-muted-foreground">
              Sélection de réalisations en branding, social media, print, UI, présentation et retouche photo.
            </p>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-8 text-sm">
            <button
              type="button"
              onClick={() => setActive(null)}
              className={`label-mono transition-colors ${active ? "text-muted-foreground hover:text-foreground" : "text-foreground"}`}
            >
              Projets
            </button>
            {activeFolder && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="label-mono" style={{ color: "var(--color-blue-accent)" }}>
                  {activeFolder.label}
                </span>
                <span className="ml-auto label-mono text-muted-foreground">
                  {filtered.length} projet{filtered.length > 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!active ? (
              <motion.div
                key="root"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.25, ease: EASE } }}
                transition={{ duration: 0.35, ease: EASE }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-10"
              >
                {FOLDERS.map((folder, i) => {
                  const count = counts[folder.slug] ?? 0;
                  return (
                    <motion.button
                      key={folder.slug}
                      type="button"
                      onClick={() => setActive(folder.slug)}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.04, ease: EASE }}
                      whileHover={{ y: -6, scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="group flex flex-col items-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue-accent)] rounded-xl p-3"
                      aria-label={`Ouvrir le dossier ${folder.label}`}
                    >
                      <div className="transition-transform duration-300 ease-out group-hover:-translate-y-1">
                        <FolderIcon color={folder.color} size={140} />
                      </div>
                      <div className="mt-4 font-display text-base sm:text-lg text-foreground">
                        {folder.label}
                      </div>
                      <div className="label-mono text-xs text-muted-foreground mt-1">
                        {count} projet{count > 1 ? "s" : ""}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key={`folder-${active}`}
                initial={{ opacity: 0, scale: 0.97, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2, ease: EASE } }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="inline-flex items-center gap-2 mb-8 text-sm label-mono text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={16} />
                  Retour aux dossiers
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((p, i) => {
                    const cat = categoryMeta(p.category as string);
                    const Icon = CATEGORY_ICONS[cat.icon] ?? Grid3X3;
                    return (
                      <motion.div
                        key={p.id as string}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: Math.min(i * 0.035, 0.3), ease: EASE }}
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
                              style={{ objectPosition: (p.cover_position as string) || "50% 50%" }}
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
                              <div className="text-xs text-white/70 mt-1">
                                {p.client as string} {p.year ? `· ${p.year}` : ""}
                              </div>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {filtered.length === 0 && (
                  <div className="text-center text-muted-foreground py-24">
                    Aucun projet dans cette catégorie pour le moment.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollFadeSection>
    </div>
  );
}
