import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/sections/Hero";
import { TypewriterStrip } from "@/components/sections/TypewriterStrip";
import { Stats } from "@/components/sections/Stats";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { Services } from "@/components/sections/Services";
import { TestimonialsCarousel } from "@/components/sections/TestimonialsCarousel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Le Maestro du Digital — Graphic Designer & Directeur Artistique" },
      {
        name: "description",
        content:
          "Portfolio de Le Maestro du Digital. 2 ans d'expérience, 100+ projets, identités visuelles premium pour marques ambitieuses.",
      },
      { property: "og:title", content: "Le Maestro du Digital — Portfolio" },
      { property: "og:description", content: "Identités visuelles premium pour marques ambitieuses." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <TypewriterStrip />
      <Stats />
      <FeaturedProjects />
      <Services />
      <TestimonialsCarousel />
    </>
  );
}
