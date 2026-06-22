import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import mdLogo from "@/assets/md.png";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/about", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);

  const isHome = path === "/";
  const effectiveScrolled = !isHome || scrolled;
  const textColor = effectiveScrolled ? "var(--color-charcoal)" : "#FFFFFF";

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: effectiveScrolled ? "rgba(255,255,255,0.85)" : "transparent",
        backdropFilter: effectiveScrolled ? "saturate(140%) blur(14px)" : "none",
        borderBottom: effectiveScrolled ? "1px solid var(--color-border)" : "1px solid transparent",
      }}
    >
      <div className="container-x flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" aria-label="Le Maestro du Digital — Accueil">
          <span
            className="inline-block h-2 w-2 rotate-45"
            style={{ background: "var(--color-blue-accent)" }}
            aria-hidden
          />
          <span className="font-display text-lg tracking-tight transition-colors" style={{ color: textColor }}>
            Le Maestro <span style={{ color: "var(--color-blue-accent)" }}>du Digital</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className="story-link text-sm transition-colors"
                style={{ color: active ? "var(--color-blue-accent)" : textColor }}
              >
                {n.label}
              </Link>
            );
          })}
          <Link
            to="/contact"
            data-cursor="cta"
            className="rounded-full px-4 py-2 text-xs label-mono"
            style={{ background: "var(--color-blue-accent)", color: "#fff" }}
          >
            Discuter
          </Link>
        </nav>

        <button
          className="md:hidden inline-flex items-center justify-center w-10 h-10"
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
          style={{ color: textColor }}
        >
          <div className="relative w-5 h-3">
            <span
              className="absolute left-0 top-0 w-5 h-px bg-current transition-transform"
              style={{ transform: open ? "translateY(6px) rotate(45deg)" : "none" }}
            />
            <span
              className="absolute left-0 bottom-0 w-5 h-px bg-current transition-transform"
              style={{ transform: open ? "translateY(-6px) rotate(-45deg)" : "none" }}
            />
          </div>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="container-x py-6 flex flex-col gap-4">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="text-base story-link">
                {n.label}
              </Link>
            ))}
            <Link
              to="/contact"
              className="rounded-full px-4 py-2 text-xs label-mono inline-block w-fit"
              style={{ background: "var(--color-blue-accent)", color: "#fff" }}
            >
              Discuter
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        background: "linear-gradient(to bottom, #0d0d0d, #1A1A1A)",
        color: "#fff",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        marginTop: "80px"
      }}
    >
      <div className="container-x py-16 grid gap-12 md:grid-cols-3">
        <div>
          <img
            src={mdLogo.url}
            alt="Le Maestro du Digital — Logo MD"
            width={96}
            height={96}
            className="h-24 w-24 object-contain mb-4"
            loading="lazy"
          />
          <div className="font-display text-2xl">
            Le Maestro <span style={{ color: "var(--color-blue-accent)" }}>du Digital</span>
          </div>
          <p className="mt-4 text-sm text-white/60 max-w-xs">
            Graphic Designer &amp; Directeur Artistique. Identités visuelles premium pour marques ambitieuses.
          </p>
        </div>
        <div>
          <div className="label-mono text-white/40 mb-4">Navigation</div>
          <ul className="space-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="story-link">{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="label-mono text-white/40 mb-4">Contact</div>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="mailto:le.maestro.du.digital@gmail.com" className="story-link">
                le.maestro.du.digital@gmail.com
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/2120777657432"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="beret"
                className="story-link"
              >
                WhatsApp +212 0777657432
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-5 flex items-center justify-between text-xs text-white/40">
          <span>© {new Date().getFullYear()} Le Maestro du Digital</span>
          <span className="font-mono">crafted with precision</span>
        </div>
      </div>
    </footer>
  );
}
