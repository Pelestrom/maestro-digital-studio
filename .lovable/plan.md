## Phase 1 — "Le Maestro du Digital" Public Portfolio

A premium, agency-grade personal portfolio adapted to this project's stack (TanStack Start + React 19 + Vite + Tailwind v4 + Lovable Cloud). Admin panel and WhatsApp server-side auto-reply are deferred to Phase 2. WhatsApp uses a `wa.me` deep link. Images use neutral placeholders pending upload.

### What ships in Phase 1

**Pages (TanStack Start routes)**
- `/` Home — loader, hero with 3D photo carousel, typewriter word rotator strip, 4-stat counters, featured projects grid, services, testimonials carousel
- `/portfolio` — 6-category sticky filter bar + masonry grid
- `/portfolio/$slug` — single project (hero, editorial layout, gallery, prev/next, related)
- `/about` — bio, values, timeline, Tools cards (Photoshop / Canva / DALL-E, official icons, no levels), Skills progress bars, certifications, CTA
- `/contact` — split layout, validated form, bilingual FR/EN email auto-reply via Resend

**Design system**
- Full color tokens (navy, blue accent, charcoal, beret, grey, brown) in `src/styles.css` under `@theme`
- Cormorant Garamond / DM Sans / JetBrains Mono loaded via `<link>` in `__root.tsx`
- Type scale, spacing, signature underline-draw on hero headline

**Motion & interactions**
- Custom `<MaestroCursor />` canvas component, 7 states (default, link hover, project hover "VOIR", CTA "CLICK" + magnetic, beret on contact/WhatsApp, scroll, text)
- Argyle diamond mouse trail (≤20 active)
- Lenis smooth scroll provider
- GSAP + ScrollTrigger: clip-path reveals, SplitText word stagger, count-up stats with elastic overshoot
- Framer Motion page transitions + filter layout animations
- vanilla-tilt on project cards, magnetic CTAs
- Page loader: "Le Maestro" typewriter + blue underline draw + clip-path exit (sessionStorage-gated)
- Scroll progress bar (top) + right-side section dots (desktop)
- `prefers-reduced-motion` short-circuits all motion; cursor disabled on touch

**Backend (Lovable Cloud)**
- Tables: `projects`, `tools`, `skills`, `certifications`, `testimonials`, `about_content`, `experience`, `messages`, `settings` (RLS + grants per platform rules)
- Public read policies for visible content; insert-only for `messages` (anon allowed for contact form)
- Seed data: 3 tools, 10 skills, settings (email, WhatsApp, autoreply text)
- TanStack Query loaders read via Supabase client; component reads use `useSuspenseQuery`

**Contact form**
- Zod-validated (name, email, project type from the 6 categories + "Autre", message — no budget field)
- Server function inserts into `messages`, then triggers Resend
- Resend via connector gateway; two emails sent:
  - Notification to `le.maestro.du.digital@gmail.com`
  - Bilingual FR + EN auto-reply to sender with the exact branded HTML layout from the spec

**SEO**
- Per-route `head()` with title, description, og:title, og:description, og:url
- Canonical on leaves; `og:type="website"` on root
- JSON-LD Person schema on `/`
- `public/robots.txt` + `public/sitemap.xml` (relative URLs until domain set)

### Technical mapping (stack adaptation)

| Spec asks for | Built as |
|---|---|
| Next.js App Router pages | TanStack Start file-based routes under `src/routes/` |
| Next.js API routes | `createServerFn` in `src/lib/*.functions.ts` |
| `next/image` | `<img loading="lazy">` + `srcset`; hero `priority` → `fetchpriority="high"` |
| `next/font` Google Fonts | `<link rel="stylesheet">` in `__root.tsx` head + `--font-*` tokens in `@theme` |
| Supabase JS | `@/integrations/supabase/client` (already wired by Lovable Cloud) |
| Auth-protected admin | Deferred to Phase 2 |
| WhatsApp Twilio auto-reply | `wa.me/2120777657432?text=...` deep link |

### Folder layout

```
src/
  routes/
    __root.tsx                  (fonts, providers, cursor, loader, scroll bar, page transitions)
    index.tsx                   (Home)
    portfolio.tsx               (layout: <Outlet />)
    portfolio.index.tsx         (gallery + filters)
    portfolio.$slug.tsx         (single project)
    about.tsx
    contact.tsx
  components/
    cursor/MaestroCursor.tsx
    scroll/LenisProvider.tsx, ScrollProgress.tsx, SectionDots.tsx
    loader/MaestroLoader.tsx
    sections/Hero.tsx, PhotoCarousel3D.tsx, TypewriterStrip.tsx,
             Stats.tsx, FeaturedProjects.tsx, Services.tsx,
             TestimonialsCarousel.tsx, ToolsCards.tsx, SkillsBars.tsx,
             Certifications.tsx, ContactForm.tsx, ContactInfo.tsx
    animations/ (GSAP hooks, Framer variants)
    ui/ (shadcn — already present)
  lib/
    contact.functions.ts        (server fn: insert message + Resend bilingual emails)
    queries/                    (TanStack Query options per entity)
    hooks/ (useCursor, useMagnetic, useReducedMotion, useTypewriter, useCountUp)
  styles.css                    (tokens, @theme, @utility, animations)
```

### Build order

1. Enable Lovable Cloud → migrations for 9 tables with grants + RLS + seed data
2. Design tokens, fonts, base layout in `__root.tsx`
3. Lenis provider + scroll progress + page transitions + loader
4. `MaestroCursor` canvas (7 states + argyle trail)
5. Home page sections in order (Hero → PhotoCarousel3D → TypewriterStrip → Stats → FeaturedProjects → Services → TestimonialsCarousel)
6. Portfolio gallery + filter + single project
7. About page (with the 3 tool cards — official simpleicons CDN, **no** progress bars on tools; skill bars only)
8. Contact page + Zod-validated server function
9. Resend connector — I will prompt to connect it when wiring the server function
10. SEO metadata + robots + sitemap
11. Reduced-motion + mobile/touch pass + Lighthouse review

### Things you'll need to do

- **Resend**: I'll ask you to connect the Resend connector when we reach the contact form. Until then the form will save messages to the DB and show success, but emails won't actually send.
- **Sender domain**: Resend requires a verified domain to send from your address. Until verified, the auto-reply "from" will be `onboarding@resend.dev` and the notification email will still arrive at your Gmail.
- **Photos**: hero carousel (2) + About profile (1) — upload after build via DB row edits, or in Phase 2 admin.

### Out of scope for Phase 1 (Phase 2)

- `/admin/*` panels and Lovable Auth gating
- TipTap rich text editor
- Media manager UI
- Twilio WhatsApp webhook + bilingual auto-reply (contact button uses `wa.me` for now)
- Optional countdown sound effect
