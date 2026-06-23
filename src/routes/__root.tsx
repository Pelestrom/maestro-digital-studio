import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { MaestroCursor } from "@/components/cursor/MaestroCursor";
import { LenisProvider } from "@/components/scroll/LenisProvider";
import { ScrollProgress } from "@/components/scroll/ScrollProgress";
import { MaestroLoader } from "@/components/loader/MaestroLoader";
import { Navbar, Footer } from "@/components/layout/Nav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="label-mono" style={{ color: "var(--color-blue-accent)" }}>404</div>
        <h1 className="font-display text-5xl mt-4">Page introuvable</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs label-mono"
            style={{ background: "var(--color-blue-accent)", color: "#fff" }}
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl">Cette page n'a pas pu se charger</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Une erreur est survenue. Essayez de rafraîchir ou revenez à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full px-5 py-2.5 text-xs label-mono"
            style={{ background: "var(--color-blue-accent)", color: "#fff" }}
          >
            Réessayer
          </button>
          <a
            href="/"
            className="rounded-full px-5 py-2.5 text-xs label-mono border"
            style={{ borderColor: "var(--color-border)" }}
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Le Maestro du Digital — Graphic Designer & Directeur Artistique" },
      {
        name: "description",
        content:
          "Le Maestro du Digital — Graphic Designer & Directeur Artistique. Identités visuelles premium, design social media, UI & print pour marques ambitieuses.",
      },
      { name: "author", content: "Le Maestro du Digital" },
      { property: "og:title", content: "Le Maestro du Digital — Graphic Designer & Directeur Artistique" },
      {
        property: "og:description",
        content: "Identités visuelles premium pour marques ambitieuses. 2 ans d'expérience, 100+ projets.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Le Maestro du Digital" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#1A1A1A" },
      { name: "twitter:title", content: "Le Maestro du Digital — Graphic Designer & Directeur Artistique" },
      { name: "description", content: "Découvrez mon portfolio — Graphic Designer & Directeur Artistique, Je conçois des identités visuelles percutantes pour des marques ambitieuses !" },
      { property: "og:description", content: "Découvrez mon portfolio — Graphic Designer & Directeur Artistique, Je conçois des identités visuelles percutantes pour des marques ambitieuses !" },
      { name: "twitter:description", content: "Découvrez mon portfolio — Graphic Designer & Directeur Artistique, Je conçois des identités visuelles percutantes pour des marques ambitieuses !" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/PVeCDLFTAcc1DaNEFwGLc3cibDJ3/social-images/social-1782181593548-Capture_d_écran_2026-06-23_032618.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/PVeCDLFTAcc1DaNEFwGLc3cibDJ3/social-images/social-1782181593548-Capture_d_écran_2026-06-23_032618.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/favicon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;700&family=JetBrains+Mono:wght@400&display=swap",
      },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Le Maestro du Digital",
          jobTitle: "Graphic Designer & Directeur Artistique",
          email: "le.maestro.du.digital@gmail.com",
          url: "/",
          sameAs: [],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LenisProvider>
        <MaestroLoader />
        <ScrollProgress />
        <MaestroCursor />
        <Navbar />
        <main>
          <Outlet />
        </main>
        <Footer />
      </LenisProvider>
    </QueryClientProvider>
  );
}
