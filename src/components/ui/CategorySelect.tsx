import { useEffect, useRef, useState } from "react";
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

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>> = {
  Grid3X3,
  Palette,
  Share2,
  Printer,
  Monitor,
  Presentation,
  Image: ImageIcon,
};

export type CategoryOption = { value: string; label: string; icon: string };

export function CategorySelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: CategoryOption[];
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];
  const CurrentIcon = (current && CATEGORY_ICONS[current.icon]) ?? Grid3X3;

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
            aria-label={ariaLabel}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Desktop: custom dropdown */}
      <div ref={wrapRef} className="hidden sm:block relative w-full">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          className="w-full inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm bg-white border transition-all hover:bg-[#EEF2FF]"
          style={{ borderColor: "#3B6FCC", color: "var(--color-charcoal)" }}
        >
          <CurrentIcon size={18} style={{ color: "#3B6FCC" }} />
          <span className="label-mono flex-1 text-left truncate">{current?.label}</span>
          <ChevronDown
            size={16}
            className="transition-transform"
            style={{ transform: open ? "rotate(180deg)" : "none" }}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute z-40 mt-2 left-0 right-0 min-w-[280px] py-2 rounded-2xl bg-white border shadow-xl overflow-hidden"
              style={{ borderColor: "#3B6FCC" }}
            >
              {options.map((o) => {
                const Icon = CATEGORY_ICONS[o.icon] ?? Grid3X3;
                const isActive = o.value === value;
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                      }}
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
