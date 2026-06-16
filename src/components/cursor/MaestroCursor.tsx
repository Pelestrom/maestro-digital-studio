import { useEffect, useRef } from "react";
import { useReducedMotion, useIsTouch } from "@/lib/hooks/useReducedMotion";

type State = "default" | "link" | "project" | "cta" | "beret";

const BERET_SVG = `
<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
  <ellipse cx="20" cy="22" rx="16" ry="9" fill="#0d0d0d"/>
  <ellipse cx="20" cy="20" rx="14" ry="8" fill="#1A1A1A"/>
  <circle cx="27" cy="14" r="2.4" fill="#3B6FCC"/>
</svg>`;

export function MaestroCursor() {
  const reduced = useReducedMotion();
  const touch = useIsTouch();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const beretRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reduced || touch) return;
    document.documentElement.classList.add("maestro-cursor-on");
    return () => document.documentElement.classList.remove("maestro-cursor-on");
  }, [reduced, touch]);

  useEffect(() => {
    if (reduced || touch) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let state: State = "default";
    const diamonds: { x: number; y: number; age: number }[] = [];
    let lastDiamondTime = 0;

    const setState = (s: State) => {
      state = s;
      const ring = ringRef.current!;
      const dot = dotRef.current!;
      const label = labelRef.current!;
      const beret = beretRef.current!;

      // reset
      ring.style.opacity = "1";
      ring.style.background = "transparent";
      ring.style.borderColor = "var(--color-blue-accent)";
      ring.style.width = "32px";
      ring.style.height = "32px";
      ring.style.borderWidth = "1px";
      dot.style.opacity = "1";
      label.textContent = "";
      label.style.opacity = "0";
      beret.style.opacity = "0";
      beret.style.transform = "translate(-50%, -50%) scale(0.6)";

      if (s === "link") {
        ring.style.width = "48px";
        ring.style.height = "48px";
        ring.style.background = "rgba(59,111,204,0.10)";
        dot.style.opacity = "0";
        label.textContent = "→";
        label.style.color = "#fff";
        label.style.fontSize = "14px";
        label.style.opacity = "1";
      } else if (s === "project") {
        ring.style.width = "64px";
        ring.style.height = "64px";
        ring.style.background = "var(--color-blue-accent)";
        ring.style.borderColor = "var(--color-blue-accent)";
        dot.style.opacity = "0";
        label.textContent = "VOIR";
        label.style.color = "#fff";
        label.style.fontSize = "10px";
        label.style.opacity = "1";
      } else if (s === "cta") {
        ring.style.width = "56px";
        ring.style.height = "56px";
        ring.style.background = "#1A1A1A";
        ring.style.borderColor = "#fff";
        dot.style.opacity = "0";
        label.textContent = "CLICK";
        label.style.color = "#fff";
        label.style.fontSize = "9px";
        label.style.opacity = "1";
      } else if (s === "beret") {
        ring.style.opacity = "0";
        dot.style.opacity = "0";
        beret.style.opacity = "1";
        beret.style.transform = "translate(-50%, -50%) scale(1)";
      }
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const t = e.target as HTMLElement | null;
      if (!t) return;
      const beret = t.closest("[data-cursor='beret']");
      const project = t.closest("[data-cursor='project']");
      const cta = t.closest("[data-cursor='cta']");
      const link = t.closest("a, button, [data-cursor='link']");
      const next: State = beret
        ? "beret"
        : project
          ? "project"
          : cta
            ? "cta"
            : link
              ? "link"
              : "default";
      if (next !== state) setState(next);
    };

    document.addEventListener("mousemove", onMove);

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`;
        ringRef.current.style.top = `${ringY}px`;
      }

      // Argyle trail
      const now = performance.now();
      if (now - lastDiamondTime > 90 && Math.hypot(mouseX - ringX, mouseY - ringY) > 3) {
        if (diamonds.length < 20) {
          diamonds.push({ x: mouseX + (Math.random() - 0.5) * 14, y: mouseY + (Math.random() - 0.5) * 14, age: 0 });
        }
        lastDiamondTime = now;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(59,111,204,1)";
      ctx.lineWidth = 1;
      for (let i = diamonds.length - 1; i >= 0; i--) {
        const d = diamonds[i];
        d.age += 1;
        const t = d.age / 36;
        if (t >= 1) {
          diamonds.splice(i, 1);
          continue;
        }
        const scale = 1 + t * 0.8;
        const alpha = 0.18 * (1 - t);
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(Math.PI / 4);
        ctx.globalAlpha = alpha;
        const s = 6 * scale;
        ctx.strokeRect(-s / 2, -s / 2, s, s);
        ctx.restore();
      }

      requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMove);
    };
  }, [reduced, touch]);

  if (reduced || touch) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[55]"
        aria-hidden
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed z-[58] rounded-full border flex items-center justify-center"
        style={{
          width: 32,
          height: 32,
          transform: "translate(-50%, -50%)",
          transition: "width .25s cubic-bezier(.34,1.56,.64,1), height .25s cubic-bezier(.34,1.56,.64,1), background .2s, border-color .2s",
          opacity: 0.85,
        }}
        aria-hidden
      >
        <div
          ref={labelRef}
          className="font-mono uppercase"
          style={{ letterSpacing: "0.1em", transition: "opacity .2s" }}
        />
      </div>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed z-[59] left-0 top-0"
        aria-hidden
      >
        <div
          ref={dotRef}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 6, height: 6, background: "var(--color-blue-accent)" }}
        />
        <div
          ref={beretRef}
          className="absolute left-0 top-0"
          style={{ width: 40, height: 40, opacity: 0, transition: "opacity .2s, transform .25s cubic-bezier(.34,1.56,.64,1)" }}
          dangerouslySetInnerHTML={{ __html: BERET_SVG }}
        />
      </div>
    </>
  );
}
