import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setP(total > 0 ? (h.scrollTop / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div className="fixed left-0 top-0 z-[60] h-[2px] w-full bg-transparent pointer-events-none">
      <div
        className="h-full bg-blue-accent transition-[width] duration-150 ease-out"
        style={{ width: `${p}%`, background: "var(--color-blue-accent)" }}
      />
    </div>
  );
}
