import { useEffect, useState } from "react";

export function MaestroLoader() {
  const [show, setShow] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("maestro-loaded");
    if (seen) return;
    setShow(true);
    document.documentElement.classList.add("maestro-loading");
    const t1 = setTimeout(() => setHide(true), 1700);
    const t2 = setTimeout(() => {
      setShow(false);
      document.documentElement.classList.remove("maestro-loading");
      sessionStorage.setItem("maestro-loaded", "1");
    }, 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.documentElement.classList.remove("maestro-loading");
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: "#1A1A1A",
        clipPath: hide ? "inset(0 0 100% 0)" : "inset(0)",
        transition: "clip-path .55s cubic-bezier(.76,0,.24,1)",
      }}
      aria-hidden
    >
      <div className="text-center">
        <div
          className="text-white font-display fade-in"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 300, letterSpacing: "-0.02em" }}
        >
          Le Maestro
          <span className="block mx-auto mt-2 h-px bg-[var(--color-blue-accent)]" style={{
            width: "100%",
            transform: "scaleX(0)",
            transformOrigin: "left",
            animation: "underline-draw 1.1s cubic-bezier(.76,0,.24,1) .25s forwards",
          }} />
        </div>
        <div
          className="mt-4 label-mono"
          style={{ color: "var(--color-blue-accent)", opacity: 0, animation: "fade-in .5s ease-out 1.05s forwards" }}
        >
          du Digital
        </div>
      </div>
    </div>
  );
}
