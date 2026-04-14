# mm-landing

Personal developer portfolio with Three.js Matrix Rain 3D effect, built on TanStack Start.

![Matrix Landing](https://img.shields.io/badge/Three.js-Matrix_Rain-00ff41?style=flat-square&logo=threedotjs&logoColor=00ff41) ![TanStack Start](https://img.shields.io/badge/TanStack-Start_SSR-00ff41?style=flat-square) ![React 19](https://img.shields.io/badge/React-19-00ff41?style=flat-square&logo=react)

## Features

- **Three.js Matrix Rain 3D** — instanced mesh rendering 2000+ falling characters with custom shaders, mouse parallax, and scroll-reactive density
- **TanStack Start SSR** — server-side rendering for SEO out of the box
- **MDX Blog** — markdown posts with syntax highlighting (Shiki), frontmatter parsing, and dedicated routes
- **PL/EN Language Switching** — zustand-powered i18n toggle, no external library
- **Matrix Design System** — `#00ff41` green theme, JetBrains Mono, glass panels, glow effects, additive blending
- **Responsive** — reduced particle count on mobile, hamburger nav, single-column layout

## Tech Stack

- **Framework:** TanStack Start + TanStack Router (file-based routing)
- **UI:** React 19, Tailwind CSS v4, shadcn/ui (Base UI)
- **3D:** React Three Fiber, Three.js (custom ShaderMaterial)
- **Blog:** MDX, rehype-pretty-code, Shiki, gray-matter
- **State:** Zustand (scroll/mouse tracking, language)
- **Monorepo:** Bun workspaces
- **Linting:** Oxlint + Oxfmt, Husky pre-commit hooks

## Getting Started

```bash
bun install
bun run dev:web
```

Open [http://localhost:3001](http://localhost:3001).

## Project Structure

```
mm-landing/
├── apps/web/                  # Main web application
│   ├── src/
│   │   ├── routes/            # TanStack file-based routes
│   │   │   ├── __root.tsx     # Root layout (Matrix Canvas, Nav)
│   │   │   ├── index.tsx      # Landing page (all sections)
│   │   │   └── blog/          # Blog routes (/blog, /blog/$slug)
│   │   ├── components/        # React components
│   │   │   ├── matrix-rain.tsx    # Three.js Matrix Rain effect
│   │   │   ├── matrix-canvas.tsx  # R3F Canvas wrapper (lazy loaded)
│   │   │   ├── hero.tsx           # Hero section
│   │   │   ├── about.tsx          # About section
│   │   │   ├── experience.tsx     # Timeline section
│   │   │   ├── projects.tsx       # Projects grid
│   │   │   ├── contact-form.tsx   # Contact form
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── scroll-store.ts    # Scroll + mouse zustand store
│   │   │   ├── language-store.ts  # PL/EN language store
│   │   │   ├── translations.ts   # Translation strings
│   │   │   └── blog.ts           # MDX blog utilities
│   │   └── content/blog/      # MDX blog posts
│   └── vite.config.ts
├── packages/
│   ├── ui/                    # Shared shadcn/ui components + design tokens
│   ├── config/                # Shared TypeScript config
│   └── env/                   # Environment variable validation
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all apps in dev mode |
| `bun run dev:web` | Start only the web app |
| `bun run build` | Build all apps |
| `bun run check-types` | TypeScript type checking |
| `bun run check` | Run Oxlint + Oxfmt |

## License

MIT
