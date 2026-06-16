import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3X3,
  Palette,
  Share2,
  Printer,
  Monitor,
  Presentation,
  Image as ImageIcon,
  ChevronDown,
  Check,
} from "lucide-react";
import { CATEGORIES, categoryMeta, projectsQuery } from "@/lib/queries";

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

const ICONS: Record<string, React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>> = {
  Grid3X3,
  Palette,
  Share2,
  Printer,
  Monitor,
  Presentation,
  Image: ImageIcon,
};

type Option = { slug: string; label: string; icon: string };

const OPTIONS: Option[] = [
  { slug: "all", label: "Toutes les catégories", icon: "Grid3X3" },
  ...CATEGORIES.map((c) => ({ slug: c.slug, label: c.label, icon: c.icon })),
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
            <CategoryDropdown value={active} onChange={setActive} />
            <span className="ml-auto label-mono" style={{ color: "var(--color-blue-accent)" }}>
              {filtered.length} projet{filtered.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => {
              const cat = categoryMeta(p.category as string);
              const Icon = ICONS[cat.icon] ?? Grid3X3;
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

function CategoryDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const current = OPTIONS.find((o) => o.slug === value) ?? OPTIONS[0];
  const CurrentIcon = ICONS[current.icon] ?? Grid3X3;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      {/* Mobile: native select */}
      <div className="sm:hidden w-full">
        <div className="relative">
          <CurrentIcon className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={18} />
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none pl-10 pr-10 py-2.5 rounded-full text-sm border bg-white"
            style={{ borderColor: "#3B6FCC", color: "var(--color-charcoal)" }}
            aria-label="Filtrer par catégorie"
          >
            {OPTIONS.map((o) => (
              <option key={o.slug} value={o.slug}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Desktop: custom dropdown */}
      <div ref={wrapRef} className="hidden sm:block relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm bg-white border transition-all hover:bg-[#EEF2FF]"
          style={{ borderColor: "#3B6FCC", color: "var(--color-charcoal)" }}
        >
          <CurrentIcon size={18} style={{ color: "#3B6FCC" }} />
          <span className="label-mono">{current.label}</span>
          <ChevronDown size={16} className="transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute z-40 mt-2 left-0 min-w-[280px] py-2 rounded-2xl bg-white border shadow-xl overflow-hidden"
              style={{ borderColor: "#3B6FCC" }}
            >
              {OPTIONS.map((o) => {
                const Icon = ICONS[o.icon] ?? Grid3X3;
                const isActive = o.slug === value;
                return (
                  <li key={o.slug}>
                    <button
                      type="button"
                      onClick={() => { onChange(o.slug); setOpen(false); }}
                      role="option"
                      aria-selected={isActive}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-[#EEF2FF]"
                      style={{
                        background: isActive ? "#3B6FCC" : "transparent",
                        color: isActive ? "#fff" : "var(--color-charcoal)",
                      }}
                    >
                      <Icon size={16} />
                      <span className="flex-1">{o.label}</span>
                      {isActive && <Check size={14} />}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
