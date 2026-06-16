import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/sections/Hero";
import { TypewriterStrip } from "@/components/sections/TypewriterStrip";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { Services } from "@/components/sections/Services";
import { TestimonialsCarousel } from "@/components/sections/TestimonialsCarousel";
import { ScrollFadeSection } from "@/components/scroll/ScrollFadeSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Le Maestro du Digital — Graphic Designer & Directeur Artistique" },
      {
        name: "description",
        content:
          "Portfolio de Le Maestro du Digital. Identités visuelles premium pour marques ambitieuses.",
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
      <ScrollFadeSection><Hero /></ScrollFadeSection>
      <ScrollFadeSection><TypewriterStrip /></ScrollFadeSection>
      <ScrollFadeSection><FeaturedProjects /></ScrollFadeSection>
      <ScrollFadeSection><Services /></ScrollFadeSection>
      <ScrollFadeSection><TestimonialsCarousel /></ScrollFadeSection>
    </>
  );
}
