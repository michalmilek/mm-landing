# Matrix Landing — Design Spec

## Overview

Personal developer portfolio landing page with a dark/matrix/techy aesthetic. Three.js Matrix Rain 3D effect runs as a full-screen interactive background canvas. Built on TanStack Start (SSR/SSG) for SEO, with a markdown-powered blog.

## Stack

- **Framework:** TanStack Start (SSR) + TanStack Router (file-based routing)
- **Build:** Vinxi (under TanStack Start) + Vite
- **Runtime:** Bun
- **UI:** React 19 + Tailwind CSS v4 + shadcn/ui (existing `@mm-landing/ui` package)
- **3D:** React Three Fiber (`@react-three/fiber`) + `@react-three/drei`
- **Blog:** MDX files compiled at build time via `@mdx-js/rollup`, syntax highlighting via `shiki`/`rehype-pretty-code`
- **Monorepo:** Existing Bun workspaces — `apps/web`, `packages/ui`, `packages/config`, `packages/env`

## Architecture

### Migration: Vite SPA → TanStack Start

The current `apps/web` is a Vite SPA with TanStack Router. Migration to TanStack Start involves:

1. Replace `vite.config.ts` with `app.config.ts` (using `defineConfig` from `@tanstack/react-start/config`)
2. Add server entry point (`src/ssr.tsx`)
3. Update `src/main.tsx` → `src/client.tsx` for client hydration
4. Update `src/routes/__root.tsx` to use Start's `<Scripts />`, `<Meta />`, `<Html />` wrappers
5. Install `@tanstack/react-start`, `vinxi`

### Routing

```
/              → Landing page (all sections in single scroll)
/blog          → Blog post list (SSR, paginated)
/blog/$slug    → Individual blog post (SSR, MDX rendered)
```

### Three.js — Client-Only Rendering

- `<MatrixCanvas />` component wraps a `<Canvas />` from R3F
- Loaded via `React.lazy()` + `<Suspense>` — never rendered server-side
- Positioned as `position: fixed; inset: 0; z-index: 0` behind all content
- Content sections sit on top with semi-transparent backgrounds + `backdrop-filter: blur()`

### Blog Architecture

- MDX files stored in `apps/web/content/blog/`
- Frontmatter schema (parsed with `gray-matter`):
  ```yaml
  title: string
  date: YYYY-MM-DD
  description: string
  tags: string[]
  ```
- Posts compiled at build time via `@mdx-js/rollup`
- TanStack Start loaders fetch post data server-side
- Syntax highlighting via `rehype-pretty-code` with `shiki` (matrix-green theme)
- Blog list sorted by date descending

## Sections

All sections scroll vertically on the landing page. Matrix Rain 3D canvas runs behind everything.

### 1. Navigation (sticky)

- Sticky top bar with `backdrop-filter: blur()` + semi-transparent background
- Left: nick as logo (`<nick />`)
- Right: section links (O mnie, Doświadczenie, Projekty, Blog, Kontakt)
- Smooth scroll to sections on click
- Collapses to hamburger on mobile

### 2. Hero

- Large nick in monospace font with green glow (`text-shadow`) — typewriter animation on load
- Real name below in smaller, neutral color
- Tagline with typewriter effect (e.g., "Full Stack Developer · Open Source")
- Social links row: GitHub, LinkedIn, Twitter/X — styled as outlined buttons
- Parallax: mouse position shifts Matrix Rain perspective slightly
- Full viewport height (`min-h-screen`)

### 3. About (`> whoami`)

- Terminal-style heading: `> whoami`
- 2-3 paragraphs about the developer
- Optional avatar/photo on the right
- Text appears with fade-in / typewriter animation on scroll-into-view
- Content on blurred panel over Matrix Rain

### 4. Experience (`> history --career`)

- Terminal-style heading: `> history --career`
- Vertical timeline with left border line in matrix green
- Each entry: date range, role, company, tech tags
- Entries fade-in sequentially as user scrolls
- Timeline line glows matrix green
- Most recent at top

### 5. Projects (`> ls ~/projects`)

- Terminal-style heading: `> ls ~/projects`
- 2-column grid (1 column on mobile)
- Each card: project name, description, tech tags, links (GitHub, live demo)
- Cards have subtle border, hover produces matrix green glow effect
- Cards on dark semi-transparent panels

### 6. Blog (`> cat /blog/latest`)

- Terminal-style heading: `> cat /blog/latest`
- Shows 3 most recent posts (title, date, reading time)
- Each post links to `/blog/$slug`
- "Wszystkie posty →" button links to `/blog`
- Minimal card style matching project cards

### 7. Contact (`> mail --compose`)

- Terminal-style heading: `> mail --compose`
- Contact form: email, subject, message, submit button
- Form styled as terminal inputs (monospace, green caret, dark bg)
- Submit button: solid matrix green with dark text
- Form submission: client-side validation, sends via email API (Resend, or simple mailto fallback)
- No backend needed initially — can use `mailto:` link or a serverless function later

## Three.js Matrix Rain 3D — Technical Design

### Core Concept

Columns of characters (katakana, digits, latin symbols) falling through 3D space along the Z-axis toward the camera. Characters rendered as instanced geometry with texture atlas for performance.

### Implementation

- **InstancedMesh** with BufferGeometry — one draw call for hundreds of characters
- **Texture atlas:** Pre-rendered character set (katakana + 0-9 + symbols) as a sprite sheet
- **Each instance:** position (x, y, z), character index (UV offset), opacity, speed
- **Animation loop:** Each frame, characters move along Z. When they pass the camera, they reset to the far plane with new random x/y, character, and speed
- **Columns:** Characters are grouped in vertical columns (same x position), staggered z positions, creating the "rain" effect

### Interactivity

- **Mouse parallax:** Mouse position (normalized -1 to 1) shifts camera rotation slightly via `lerp` — smooth, not jarring
- **Scroll response:** Scroll progress (0-1 over page height) adjusts:
  - Rain density (more particles near top/hero, fewer as you scroll)
  - Rain speed (slows down slightly in content-heavy sections)
  - Camera FOV or zoom (subtle)
- **Scroll data:** Passed via React context or `zustand` store, consumed by the R3F canvas

### Performance

- Target: 60fps on mid-range devices
- Instanced rendering — single draw call
- Characters as flat planes with alpha texture (not 3D text geometry)
- Reduce particle count on mobile (detect via `navigator.hardwareConcurrency` or viewport width)
- `frameloop="demand"` or adaptive framerate via `@react-three/fiber`
- `will-change: transform` avoided on canvas to reduce compositing overhead

## Design System

### Colors

- **Background:** `#0a0a0a` (near black)
- **Primary/accent:** `#00ff41` (matrix green)
- **Text:** `#e0e0e0` (light gray for body), `#ffffff` (white for headings)
- **Muted:** `#808080` (secondary text), `#00ff4180` (green at 50% opacity)
- **Panels:** `#0a0a0a` at 80-90% opacity with `backdrop-filter: blur(8px)`
- **Borders:** `#00ff41` at 10-20% opacity

### Typography

- **Headings / terminal commands:** Monospace (JetBrains Mono or Fira Code)
- **Body text:** Inter (already in the project) or system sans-serif
- **Code blocks (blog):** Same monospace as headings

### Animations

- **Typewriter:** Characters appear one by one with blinking cursor
- **Fade-in on scroll:** Sections and timeline entries animate in using Intersection Observer
- **Hover glow:** Cards and buttons get `box-shadow: 0 0 20px #00ff4140` on hover
- **Glitch effect:** Optional subtle text glitch on nick in hero (CSS-based)

### Responsive

- **Desktop (>1024px):** Full layout, 2-col project grid, full Matrix Rain density
- **Tablet (768-1024px):** Slightly reduced rain density, 2-col grid maintained
- **Mobile (<768px):** 1-col layout, hamburger nav, reduced Matrix Rain particles, touch-friendly spacing

## File Structure

```
apps/web/
├── app.config.ts              # TanStack Start config
├── src/
│   ├── client.tsx             # Client entry (hydration)
│   ├── ssr.tsx                # Server entry
│   ├── router.tsx             # Router setup
│   ├── index.css              # Global styles
│   ├── routes/
│   │   ├── __root.tsx         # Root layout (nav, matrix canvas, footer)
│   │   ├── index.tsx          # Landing page (all sections)
│   │   ├── blog/
│   │   │   ├── index.tsx      # Blog list
│   │   │   └── $slug.tsx      # Single post
│   ├── components/
│   │   ├── matrix-canvas.tsx  # R3F canvas wrapper (lazy loaded)
│   │   ├── matrix-rain.tsx    # Matrix Rain 3D scene/effect
│   │   ├── hero.tsx
│   │   ├── about.tsx
│   │   ├── experience.tsx
│   │   ├── projects.tsx
│   │   ├── blog-preview.tsx
│   │   ├── contact-form.tsx
│   │   ├── nav.tsx
│   │   ├── section-heading.tsx # Reusable "> command" heading
│   │   ├── typewriter.tsx     # Typewriter text effect
│   │   └── scroll-fade-in.tsx # Intersection Observer wrapper
│   ├── lib/
│   │   ├── scroll-store.ts   # Zustand store for scroll/mouse position
│   │   └── blog.ts           # Blog utilities (load posts, parse frontmatter)
│   └── content/
│       └── blog/
│           └── *.mdx          # Blog posts
```

## Dependencies to Add

```
# TanStack Start
@tanstack/react-start
vinxi

# Three.js
three
@react-three/fiber
@react-three/drei
@types/three

# Blog / MDX
@mdx-js/rollup
@mdx-js/react
gray-matter
rehype-pretty-code
shiki
remark-gfm

# Utilities
zustand                    # Scroll/mouse state management

# Fonts
@fontsource/jetbrains-mono # Monospace font
```

## Out of Scope (for now)

- Contact form backend (start with `mailto:` link)
- Blog CMS or admin UI
- i18n / multi-language
- Analytics
- PWA / offline support
- Deployment configuration (Vercel, Cloudflare, etc.)
