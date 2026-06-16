import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { aboutContentQuery } from "@/lib/queries";

const HERO_PLACEHOLDERS = [
  // Stylized SVG placeholders mimicking the designer's beret/argyle aesthetic
  "data:image/svg+xml;utf8," +
    encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'>
      <defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
      <stop offset='0' stop-color='#1B2A4A'/><stop offset='1' stop-color='#0d1424'/></linearGradient></defs>
      <rect width='600' height='800' fill='url(#g)'/>
      <g opacity='0.18' stroke='#3B6FCC' stroke-width='1' fill='none'>
        ${Array.from({ length: 8 }).map((_, i) => `<path d='M0 ${100 + i * 90} L600 ${50 + i * 90}'/>`).join("")}
      </g>
      <ellipse cx='300' cy='220' rx='130' ry='70' fill='#1A1A1A'/>
      <ellipse cx='300' cy='205' rx='115' ry='60' fill='#0d0d0d'/>
      <circle cx='370' cy='180' r='6' fill='#3B6FCC'/>
      <rect x='200' y='340' width='200' height='260' rx='8' fill='#1B2A4A'/>
      <text x='300' y='720' text-anchor='middle' fill='#7BA7DC' font-family='monospace' font-size='14' letter-spacing='4'>PORTRAIT 01</text>
    </svg>`),
  "data:image/svg+xml;utf8," +
    encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'>
      <defs><linearGradient id='g2' x1='0' x2='1' y1='0' y2='1'>
      <stop offset='0' stop-color='#2C2C35'/><stop offset='1' stop-color='#1A1A1A'/></linearGradient></defs>
      <rect width='600' height='800' fill='url(#g2)'/>
      <g opacity='0.12' stroke='#7BA7DC' stroke-width='1' fill='none'>
        ${Array.from({ length: 12 }).map((_, i) => `<rect x='${i * 50}' y='${i * 40}' width='80' height='80' transform='rotate(45 ${i * 50 + 40} ${i * 40 + 40})'/>`).join("")}
      </g>
      <ellipse cx='300' cy='240' rx='140' ry='80' fill='#0d0d0d'/>
      <ellipse cx='300' cy='220' rx='124' ry='68' fill='#1A1A1A'/>
      <rect x='190' y='360' width='220' height='280' rx='6' fill='#2C2C35'/>
      <line x1='190' y1='420' x2='410' y2='420' stroke='#3B6FCC' stroke-width='2'/>
      <text x='300' y='720' text-anchor='middle' fill='#7BA7DC' font-family='monospace' font-size='14' letter-spacing='4'>PORTRAIT 02</text>
    </svg>`),
];

export function PhotoCarousel3D() {
  const { data: about } = useQuery(aboutContentQuery());
  const photos: string[] =
    Array.isArray(about?.hero_photos) && about!.hero_photos.length > 0
      ? (about!.hero_photos as string[])
      : HERO_PLACEHOLDERS;

  const [index, setIndex] = useState(0);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (photos.length < 2) return;
    const id = setInterval(() => {
      setFlipping(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % photos.length);
      }, 450);
      setTimeout(() => setFlipping(false), 900);
    }, 4000);
    return () => clearInterval(id);
  }, [photos.length]);

  return (
    <div className="relative" style={{ perspective: "1000px" }}>
      <div
        className="relative aspect-[3/4] w-full max-w-md mx-auto overflow-hidden rounded-xl"
        style={{
          transformStyle: "preserve-3d",
          transform: flipping ? "rotateY(-90deg) scale(1.03) translateZ(40px)" : "rotateY(0) scale(1)",
          transition: "transform .9s cubic-bezier(.4,0,.2,1)",
          boxShadow: "0 24px 80px -20px rgba(0,0,0,.55)",
        }}
      >
        <img
          src={photos[index]}
          alt="Le Maestro du Digital — portrait"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{ boxShadow: "inset 0 0 0 1px rgba(59,111,204,0.35)" }}
        />
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Voir portrait ${i + 1}`}
            className="h-1.5 w-1.5 rounded-full border"
            style={{
              borderColor: "var(--color-blue-accent)",
              background: i === index ? "var(--color-blue-accent)" : "transparent",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "#0d0d0d", color: "#fff" }}
    >
      {/* Decorative argyle backdrop */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="argyle" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="#3B6FCC" strokeWidth="0.4" opacity="0.18" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#argyle)" />
      </svg>
      <div
        className="pointer-events-none absolute -left-32 top-1/3 w-[520px] h-[520px] rounded-full"
        style={{ border: "1px solid rgba(27,42,74,0.45)" }}
        aria-hidden
      />

      <div className="container-x relative grid lg:grid-cols-12 gap-12 items-center pt-32 pb-24">
        <div className="lg:col-span-7">
          <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>
            Graphic Designer &amp; Directeur Artistique
          </div>
          <h1 className="text-hero mt-6">
            <span className="block fade-in" style={{ animationDelay: "60ms" }}>Le Maestro</span>
            <span
              className="block fade-in"
              style={{ color: "var(--color-blue-accent)", animationDelay: "200ms" }}
            >
              du Digital
            </span>
            <span className="block fade-in" style={{ animationDelay: "340ms" }}>crée.</span>
          </h1>
          <p
            className="mt-8 max-w-md text-base fade-in"
            style={{ color: "#C4C4CC", animationDelay: "500ms" }}
          >
            2 ans d'expérience · 100+ projets · 10+ clients accompagnés.<br />
            Je conçois des identités visuelles percutantes pour des marques ambitieuses.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 fade-in" style={{ animationDelay: "640ms" }}>
            <Link
              to="/portfolio"
              data-cursor="cta"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm label-mono transition-transform hover:scale-[1.03]"
              style={{ background: "var(--color-blue-accent)", color: "#fff" }}
            >
              Voir mes projets <span aria-hidden>→</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm label-mono border border-white/30 hover:border-white"
              style={{ color: "#fff" }}
            >
              Me contacter
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 fade-in" style={{ animationDelay: "300ms" }}>
          <PhotoCarousel3D />
        </div>
      </div>
    </section>
  );
}
