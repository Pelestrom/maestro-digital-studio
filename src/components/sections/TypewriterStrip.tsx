import { useTypewriter } from "@/lib/hooks/useTypewriter";

const WORDS = [
  "BRANDING",
  "IDENTITÉ VISUELLE",
  "SOCIAL MEDIA DESIGN",
  "PRINT DESIGN",
  "WEB & UI DESIGN",
  "TYPOGRAPHIE",
  "DIRECTION ARTISTIQUE",
  "PHOTO EDITING",
  "PRESENTATION DESIGN",
];

export function TypewriterStrip() {
  const word = useTypewriter(WORDS);
  return (
    <section
      className="py-6"
      style={{ background: "var(--color-blue-accent)", color: "#fff" }}
      aria-label="Domaines d'expertise"
    >
      <div className="container-x flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono uppercase text-sm md:text-base" style={{ letterSpacing: "0.15em" }}>
        <span>Le Maestro du Digital crée du</span>
        <span className="inline-flex items-center" style={{ minWidth: 320 }}>
          <span>{word}</span>
          <span className="ml-0.5 inline-block w-[2px] h-[1.1em] bg-white cursor-blink" aria-hidden />
        </span>
      </div>
    </section>
  );
}
