import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, DEFAULT_COUNTRY, type Country, findCountryByCode } from "@/lib/countries";

type Props = {
  countryCode: string;
  localNumber: string;
  onChange: (next: { countryCode: string; localNumber: string }) => void;
};

export function PhoneInput({ countryCode, localNumber, onChange }: Props) {
  const country = findCountryByCode(countryCode) ?? DEFAULT_COUNTRY;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [query]);

  function select(c: Country) {
    onChange({ countryCode: c.code, localNumber });
    setOpen(false);
    setQuery("");
  }

  function onNumber(e: React.ChangeEvent<HTMLInputElement>) {
    // keep only digits and spaces for display
    const cleaned = e.target.value.replace(/[^\d\s]/g, "");
    onChange({ countryCode, localNumber: cleaned });
  }

  return (
    <div className="relative" ref={ref}>
      <div
        className="flex items-stretch border-b border-border focus-within:border-[var(--color-blue-accent)] transition-colors"
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 pr-3 py-3 text-base shrink-0"
          aria-label="Choisir le pays"
        >
          <span className="text-xl leading-none">{country.flag}</span>
          <span className="text-sm font-mono text-muted-foreground">{country.dial}</span>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-muted-foreground">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <input
          type="tel"
          inputMode="tel"
          value={localNumber}
          onChange={onNumber}
          placeholder="612 345 678"
          autoComplete="tel-national"
          className="flex-1 bg-transparent py-3 text-base focus:outline-none placeholder:text-muted-foreground"
        />
      </div>

      {open && (
        <div
          className="absolute z-50 mt-2 w-full max-w-sm rounded-xl border bg-background shadow-lg overflow-hidden"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="p-2 border-b" style={{ borderColor: "var(--color-border)" }}>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un pays…"
              className="w-full rounded-md px-3 py-2 text-sm bg-transparent focus:outline-none border"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => select(c)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted text-left ${c.code === country.code ? "bg-muted" : ""}`}
                >
                  <span className="text-lg">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{c.dial}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-sm text-muted-foreground text-center">
                Aucun pays trouvé.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
