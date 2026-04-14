# Matrix Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal developer portfolio landing page with Three.js Matrix Rain 3D background, dark/matrix aesthetic, TanStack Start SSR, and an MDX-powered blog.

**Architecture:** Migrate existing Vite SPA (`apps/web`) to TanStack Start for SSR/SEO. Three.js Matrix Rain rendered client-only via React Three Fiber on a fixed canvas behind semi-transparent content panels. Blog powered by MDX files with frontmatter, compiled at build time.

**Tech Stack:** TanStack Start, React 19, React Three Fiber, Tailwind CSS v4, shadcn/ui, Zustand, MDX, Shiki, Bun

---

## File Structure

```
apps/web/
├── vite.config.ts              # Updated: TanStack Start + Nitro plugins
├── src/
│   ├── client.tsx              # NEW: Client hydration entry
│   ├── server.ts               # NEW: Server entry (SSR)
│   ├── router.tsx              # NEW: Router setup (extracted from main.tsx)
│   ├── index.css               # MODIFIED: Add matrix theme vars + font imports
│   ├── routes/
│   │   ├── __root.tsx          # MODIFIED: SSR html shell, matrix canvas, nav
│   │   ├── index.tsx           # REWRITTEN: Landing page with all sections
│   │   └── blog/
│   │       ├── index.tsx       # NEW: Blog post list
│   │       └── $slug.tsx       # NEW: Single blog post
│   ├── components/
│   │   ├── matrix-canvas.tsx   # NEW: R3F canvas wrapper (lazy loaded)
│   │   ├── matrix-rain.tsx     # NEW: Matrix Rain 3D instanced mesh effect
│   │   ├── nav.tsx             # NEW: Sticky matrix-styled navigation
│   │   ├── hero.tsx            # NEW: Hero section with typewriter
│   │   ├── about.tsx           # NEW: About section
│   │   ├── experience.tsx      # NEW: Timeline section
│   │   ├── projects.tsx        # NEW: Project cards grid
│   │   ├── blog-preview.tsx    # NEW: Latest posts preview
│   │   ├── contact-form.tsx    # NEW: Contact form
│   │   ├── section-heading.tsx # NEW: Terminal-style "> command" heading
│   │   ├── typewriter.tsx      # NEW: Typewriter text animation
│   │   ├── scroll-fade-in.tsx  # NEW: Intersection Observer fade-in wrapper
│   │   ├── header.tsx          # DELETE (replaced by nav.tsx)
│   │   ├── mode-toggle.tsx     # DELETE (dark-only, no toggle needed)
│   │   ├── loader.tsx          # KEEP
│   │   └── theme-provider.tsx  # KEEP
│   ├── lib/
│   │   ├── scroll-store.ts    # NEW: Zustand store for scroll + mouse position
│   │   └── blog.ts            # NEW: Blog post loading utilities
│   └── content/
│       └── blog/
│           └── hello-world.mdx # NEW: Sample blog post
├── index.html                  # DELETE (TanStack Start manages html)
```

**Packages modified:**
- `packages/ui/src/styles/globals.css` — Add matrix green color tokens alongside existing theme

---

### Task 1: Migrate apps/web to TanStack Start

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/vite.config.ts`
- Create: `apps/web/src/router.tsx`
- Create: `apps/web/src/client.tsx`
- Create: `apps/web/src/server.ts`
- Modify: `apps/web/src/routes/__root.tsx`
- Delete: `apps/web/index.html`
- Delete: `apps/web/src/main.tsx`

- [ ] **Step 1: Install TanStack Start dependencies**

Run from monorepo root:
```bash
cd apps/web && bun add @tanstack/react-start vinxi nitro && cd ../..
```

- [ ] **Step 2: Update vite.config.ts for TanStack Start**

Replace `apps/web/vite.config.ts` entirely:

```ts
// apps/web/vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3001,
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    react(),
    nitro(),
  ],
});
```

- [ ] **Step 3: Create router.tsx**

Extract router setup from `main.tsx` into a dedicated file:

```tsx
// apps/web/src/router.tsx
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPendingComponent: () => <Loader />,
    scrollRestoration: true,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
```

- [ ] **Step 4: Create client.tsx (client hydration entry)**

```tsx
// apps/web/src/client.tsx
import { StartClient } from "@tanstack/react-start/client";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>,
);
```

- [ ] **Step 5: Create server.ts (server entry)**

```ts
// apps/web/src/server.ts
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export default createServerEntry({
  fetch(request) {
    return handler.fetch(request);
  },
});
```

- [ ] **Step 6: Update __root.tsx for SSR html shell**

Replace `apps/web/src/routes/__root.tsx`:

```tsx
// apps/web/src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from "react";
import { Outlet, HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme-provider";

import "../index.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "mm-landing" },
      { name: "description", content: "Personal developer portfolio" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#0a0a0a] text-foreground font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          storageKey="vite-ui-theme"
        >
          {children}
        </ThemeProvider>
        <TanStackRouterDevtools position="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Delete old SPA files**

```bash
rm apps/web/index.html apps/web/src/main.tsx
```

- [ ] **Step 8: Update package.json scripts**

Update `apps/web/package.json` scripts section:

```json
{
  "scripts": {
    "dev": "vinxi dev",
    "build": "vinxi build",
    "serve": "vinxi start",
    "start": "vinxi start",
    "check-types": "tsc --noEmit"
  }
}
```

- [ ] **Step 9: Update tsconfig.json**

Update `apps/web/tsconfig.json` to add path alias:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "types": ["vite/client"],
    "rootDirs": ["."],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@mm-landing/ui/*": ["../../packages/ui/src/*"]
    }
  }
}
```

- [ ] **Step 10: Verify dev server runs**

```bash
cd apps/web && bun run dev
```

Expected: Server starts on port 3001, page renders with current placeholder content. No errors in terminal. If route tree regeneration is needed, TanStack Router plugin handles it automatically.

- [ ] **Step 11: Commit**

```bash
git add -A apps/web/
git commit -m "migrate apps/web from Vite SPA to TanStack Start SSR"
```

---

### Task 2: Design system — Matrix theme colors & fonts

**Files:**
- Modify: `packages/ui/src/styles/globals.css`
- Modify: `apps/web/src/index.css`
- Modify: `apps/web/package.json` (add font dep)

- [ ] **Step 1: Install JetBrains Mono font**

```bash
cd apps/web && bun add @fontsource-variable/jetbrains-mono
```

- [ ] **Step 2: Update globals.css with matrix theme tokens**

In `packages/ui/src/styles/globals.css`, add matrix-specific custom properties inside the `.dark` block after the existing variables:

```css
/* Add at end of .dark block, after --sidebar-ring */
  --matrix: oklch(0.84 0.29 142);
  --matrix-foreground: oklch(0.145 0 0);
  --matrix-glow: oklch(0.84 0.29 142 / 40%);
  --matrix-dim: oklch(0.84 0.29 142 / 15%);
  --matrix-border: oklch(0.84 0.29 142 / 20%);
  --panel: oklch(0.145 0 0 / 85%);
```

Also add in the `@theme inline` block:

```css
  --color-matrix: var(--matrix);
  --color-matrix-foreground: var(--matrix-foreground);
  --color-matrix-glow: var(--matrix-glow);
  --color-matrix-dim: var(--matrix-dim);
  --color-matrix-border: var(--matrix-border);
  --color-panel: var(--panel);
```

Also add in the `@theme inline` block for the font:

```css
  --font-mono: "JetBrains Mono Variable", monospace;
```

- [ ] **Step 3: Update apps/web index.css with font import**

Replace `apps/web/src/index.css`:

```css
@import "@fontsource-variable/jetbrains-mono";
@import "@mm-landing/ui/globals.css";

/* Matrix-specific utilities */
@layer utilities {
  .text-glow {
    text-shadow: 0 0 10px var(--matrix-glow), 0 0 30px var(--matrix-glow);
  }

  .box-glow {
    box-shadow: 0 0 15px var(--matrix-glow), 0 0 30px oklch(0.84 0.29 142 / 20%);
  }

  .glass-panel {
    background: var(--panel);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
}
```

- [ ] **Step 4: Verify styles compile**

```bash
cd apps/web && bun run dev
```

Expected: Dev server starts, no CSS compilation errors.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/styles/globals.css apps/web/src/index.css apps/web/package.json
git commit -m "add matrix green theme tokens and JetBrains Mono font"
```

---

### Task 3: Zustand scroll & mouse store

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/src/lib/scroll-store.ts`

- [ ] **Step 1: Install zustand**

```bash
cd apps/web && bun add zustand
```

- [ ] **Step 2: Create scroll-store.ts**

```ts
// apps/web/src/lib/scroll-store.ts
import { create } from "zustand";

interface ScrollStore {
  /** Scroll progress 0-1 over total page height */
  scrollProgress: number;
  /** Normalized mouse position -1 to 1 on each axis */
  mouseX: number;
  mouseY: number;
  setScrollProgress: (progress: number) => void;
  setMouse: (x: number, y: number) => void;
}

export const useScrollStore = create<ScrollStore>((set) => ({
  scrollProgress: 0,
  mouseX: 0,
  mouseY: 0,
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setMouse: (x, y) => set({ mouseX: x, mouseY: y }),
}));

/**
 * Call this once at the root layout level to bind
 * window scroll and mousemove events to the store.
 * Returns a cleanup function.
 */
export function bindScrollAndMouse(): () => void {
  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    useScrollStore.getState().setScrollProgress(progress);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    useScrollStore.getState().setMouse(x, y);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("mousemove", handleMouseMove, { passive: true });

  // Set initial values
  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("mousemove", handleMouseMove);
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/scroll-store.ts apps/web/package.json
git commit -m "add zustand scroll and mouse position store"
```

---

### Task 4: Reusable UI components — SectionHeading, Typewriter, ScrollFadeIn

**Files:**
- Create: `apps/web/src/components/section-heading.tsx`
- Create: `apps/web/src/components/typewriter.tsx`
- Create: `apps/web/src/components/scroll-fade-in.tsx`

- [ ] **Step 1: Create SectionHeading component**

```tsx
// apps/web/src/components/section-heading.tsx
import { cn } from "@mm-landing/ui/lib/utils";

interface SectionHeadingProps {
  command: string;
  className?: string;
}

export function SectionHeading({ command, className }: SectionHeadingProps) {
  return (
    <h2
      className={cn(
        "font-mono text-xl md:text-2xl font-bold text-matrix text-glow mb-6",
        className,
      )}
    >
      <span className="text-matrix/60">&gt; </span>
      {command}
      <span className="ml-1 inline-block w-2.5 h-5 bg-matrix animate-pulse align-middle" />
    </h2>
  );
}
```

- [ ] **Step 2: Create Typewriter component**

```tsx
// apps/web/src/components/typewriter.tsx
import { cn } from "@mm-landing/ui/lib/utils";
import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export function Typewriter({
  text,
  speed = 50,
  delay = 0,
  className,
  onComplete,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const delayTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(delayTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    }

    onComplete?.();
  }, [displayedText, started, text, speed, onComplete]);

  return (
    <span className={cn("font-mono", className)}>
      {displayedText}
      {displayedText.length < text.length && (
        <span className="inline-block w-2 h-4 bg-matrix animate-pulse align-middle ml-0.5" />
      )}
    </span>
  );
}
```

- [ ] **Step 3: Create ScrollFadeIn component**

```tsx
// apps/web/src/components/scroll-fade-in.tsx
import { cn } from "@mm-landing/ui/lib/utils";
import { type ReactNode, useEffect, useRef, useState } from "react";

interface ScrollFadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollFadeIn({ children, className, delay = 0 }: ScrollFadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/section-heading.tsx apps/web/src/components/typewriter.tsx apps/web/src/components/scroll-fade-in.tsx
git commit -m "add reusable section-heading, typewriter, and scroll-fade-in components"
```

---

### Task 5: Three.js Matrix Rain canvas

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/src/components/matrix-rain.tsx`
- Create: `apps/web/src/components/matrix-canvas.tsx`

- [ ] **Step 1: Install Three.js dependencies**

```bash
cd apps/web && bun add three @react-three/fiber @react-three/drei && bun add -d @types/three
```

- [ ] **Step 2: Create matrix-rain.tsx — the 3D effect**

```tsx
// apps/web/src/components/matrix-rain.tsx
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useScrollStore } from "@/lib/scroll-store";

// Characters: katakana range + digits + some symbols
const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789@#$%&";
const COLUMN_COUNT = 60;
const CHARS_PER_COLUMN = 20;
const TOTAL_CHARS = COLUMN_COUNT * CHARS_PER_COLUMN;
const SPREAD_X = 40;
const SPREAD_Z = 50;
const FALL_SPEED_MIN = 2;
const FALL_SPEED_MAX = 8;

/** Generate a canvas texture with a single character */
function createCharTexture(char: string): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, size, size);
  ctx.font = `${size * 0.7}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#00ff41";
  ctx.fillText(char, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function MatrixRain() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-generate per-instance data
  const instanceData = useMemo(() => {
    const data = [];
    for (let col = 0; col < COLUMN_COUNT; col++) {
      const x = (col / COLUMN_COUNT - 0.5) * SPREAD_X;
      for (let row = 0; row < CHARS_PER_COLUMN; row++) {
        data.push({
          x,
          y: (row / CHARS_PER_COLUMN) * SPREAD_Z - SPREAD_Z * Math.random(),
          z: -Math.random() * SPREAD_Z,
          speed: FALL_SPEED_MIN + Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN),
          opacity: 0.1 + Math.random() * 0.9,
          charIndex: Math.floor(Math.random() * CHARS.length),
        });
      }
    }
    return data;
  }, []);

  // Create a shared texture atlas (single character for simplicity, rotated per instance)
  const texture = useMemo(() => {
    const randomChar = CHARS[Math.floor(Math.random() * CHARS.length)]!;
    return createCharTexture(randomChar);
  }, []);

  // Per-instance colors for varying opacity
  const colors = useMemo(() => {
    const arr = new Float32Array(TOTAL_CHARS * 3);
    for (let i = 0; i < TOTAL_CHARS; i++) {
      const d = instanceData[i]!;
      // Green channel varies by opacity, slight tint variation
      arr[i * 3] = 0;
      arr[i * 3 + 1] = d.opacity;
      arr[i * 3 + 2] = d.opacity * 0.25;
    }
    return arr;
  }, [instanceData]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { scrollProgress, mouseX, mouseY } = useScrollStore.getState();
    // Reduce density as user scrolls (skip more chars)
    const densityFactor = 1 - scrollProgress * 0.4;
    // Speed modifier
    const speedMod = 1 - scrollProgress * 0.3;

    for (let i = 0; i < TOTAL_CHARS; i++) {
      const d = instanceData[i]!;

      // Skip some instances based on density
      if (d.opacity < 1 - densityFactor) {
        dummy.position.set(0, -9999, 0);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }

      // Fall downward
      d.y -= d.speed * delta * speedMod;

      // Reset when fallen past camera
      if (d.y < -SPREAD_Z / 2) {
        d.y = SPREAD_Z / 2 + Math.random() * 10;
        d.charIndex = Math.floor(Math.random() * CHARS.length);
      }

      dummy.position.set(
        d.x + mouseX * 0.5,
        d.y,
        d.z,
      );
      dummy.scale.setScalar(0.3);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    // Subtle camera sway based on mouse
    state.camera.rotation.y = THREE.MathUtils.lerp(
      state.camera.rotation.y,
      mouseX * 0.05,
      0.05,
    );
    state.camera.rotation.x = THREE.MathUtils.lerp(
      state.camera.rotation.x,
      mouseY * 0.03,
      0.05,
    );
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, TOTAL_CHARS]}
    >
      <planeGeometry args={[0.5, 0.8]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.9}
        side={THREE.DoubleSide}
        depthWrite={false}
        vertexColors
      >
        <primitive attach="color" object={new THREE.Color("#00ff41")} />
      </meshBasicMaterial>
    </instancedMesh>
  );
}
```

**Note:** This is a simplified first pass. The instanced mesh renders flat green planes that fall downward. Each instance has varying opacity via vertex colors. Mouse and scroll are read from the zustand store on each frame without causing React re-renders.

- [ ] **Step 3: Create matrix-canvas.tsx — lazy-loaded R3F wrapper**

```tsx
// apps/web/src/components/matrix-canvas.tsx
import { Canvas } from "@react-three/fiber";

import { MatrixRain } from "./matrix-rain";

export function MatrixCanvas() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <MatrixRain />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/matrix-rain.tsx apps/web/src/components/matrix-canvas.tsx apps/web/package.json
git commit -m "add Three.js Matrix Rain 3D effect with R3F"
```

---

### Task 6: Navigation component

**Files:**
- Create: `apps/web/src/components/nav.tsx`
- Delete: `apps/web/src/components/header.tsx`
- Delete: `apps/web/src/components/mode-toggle.tsx`

- [ ] **Step 1: Create nav.tsx**

```tsx
// apps/web/src/components/nav.tsx
import { cn } from "@mm-landing/ui/lib/utils";
import { Link, useRouter } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const SECTIONS = [
  { id: "about", label: "O mnie" },
  { id: "experience", label: "Doświadczenie" },
  { id: "projects", label: "Projekty" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Kontakt" },
] as const;

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback(
    (id: string) => {
      // If on a different page, navigate home first
      if (router.state.location.pathname !== "/") {
        void router.navigate({ to: "/" }).then(() => {
          setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        });
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
      setMobileOpen(false);
    },
    [router],
  );

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass-panel border-b border-matrix-border" : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
        {/* Logo / nick */}
        <Link to="/" className="font-mono text-sm font-bold text-matrix text-glow">
          &lt;nick /&gt;
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className="font-mono text-xs text-matrix/70 hover:text-matrix transition-colors"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden text-matrix"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-panel border-t border-matrix-border px-4 py-4 flex flex-col gap-3">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className="font-mono text-sm text-matrix/70 hover:text-matrix text-left transition-colors"
            >
              &gt; {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Delete old header and mode-toggle**

```bash
rm apps/web/src/components/header.tsx apps/web/src/components/mode-toggle.tsx
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/nav.tsx
git rm apps/web/src/components/header.tsx apps/web/src/components/mode-toggle.tsx
git commit -m "replace header with matrix-styled sticky nav"
```

---

### Task 7: Landing page sections

**Files:**
- Create: `apps/web/src/components/hero.tsx`
- Create: `apps/web/src/components/about.tsx`
- Create: `apps/web/src/components/experience.tsx`
- Create: `apps/web/src/components/projects.tsx`
- Create: `apps/web/src/components/blog-preview.tsx`
- Create: `apps/web/src/components/contact-form.tsx`

- [ ] **Step 1: Create Hero section**

```tsx
// apps/web/src/components/hero.tsx
import { Github, Linkedin, Twitter } from "lucide-react";

import { Typewriter } from "./typewriter";

const SOCIAL_LINKS = [
  { icon: Github, href: "https://github.com/", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/", label: "LinkedIn" },
  { icon: Twitter, href: "https://x.com/", label: "Twitter/X" },
] as const;

export function Hero() {
  return (
    <section
      id="hero"
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center"
    >
      <h1 className="font-mono text-5xl md:text-7xl font-bold text-matrix text-glow mb-3">
        tw0j_nick
      </h1>
      <p className="text-lg text-foreground/70 mb-4">Imię Nazwisko</p>
      <div className="text-sm text-matrix/80 mb-8 h-6">
        <Typewriter
          text="Full Stack Developer · Open Source · Matrix Enthusiast"
          speed={40}
          delay={500}
        />
      </div>
      <div className="flex gap-3">
        {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md border border-matrix-border px-4 py-2 font-mono text-xs text-matrix hover:box-glow transition-all duration-300"
          >
            <Icon size={14} />
            {label}
          </a>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create About section**

```tsx
// apps/web/src/components/about.tsx
import { ScrollFadeIn } from "./scroll-fade-in";
import { SectionHeading } from "./section-heading";

export function About() {
  return (
    <section id="about" className="relative z-10 py-20 px-4">
      <div className="mx-auto max-w-3xl glass-panel rounded-xl border border-matrix-border p-8">
        <SectionHeading command="whoami" />
        <ScrollFadeIn>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4 text-foreground/80 leading-relaxed">
              <p>
                Cześć! Jestem developerem z pasją do budowania rzeczy, które działają
                szybko i wyglądają dobrze. Specjalizuję się w full-stack web development
                z naciskiem na TypeScript, React i Node.js.
              </p>
              <p>
                Kiedy nie koduję, kontrybuuję do open source i eksperymentuję z nowymi
                technologiami. Ten landing? Zbudowałem go z Three.js, bo dlaczego nie.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-lg border border-matrix-border bg-matrix-dim flex items-center justify-center font-mono text-xs text-matrix/50">
                avatar
              </div>
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create Experience section**

```tsx
// apps/web/src/components/experience.tsx
import { ScrollFadeIn } from "./scroll-fade-in";
import { SectionHeading } from "./section-heading";

interface TimelineEntry {
  period: string;
  role: string;
  company: string;
  tech: string[];
}

const TIMELINE: TimelineEntry[] = [
  {
    period: "2024 — teraz",
    role: "Senior Developer",
    company: "Firma A",
    tech: ["React", "TypeScript", "Node.js", "AWS"],
  },
  {
    period: "2022 — 2024",
    role: "Mid Developer",
    company: "Firma B",
    tech: ["Vue", "Python", "Docker", "PostgreSQL"],
  },
  {
    period: "2020 — 2022",
    role: "Junior Developer",
    company: "Startup C",
    tech: ["JavaScript", "PHP", "MySQL"],
  },
];

export function Experience() {
  return (
    <section id="experience" className="relative z-10 py-20 px-4">
      <div className="mx-auto max-w-3xl glass-panel rounded-xl border border-matrix-border p-8">
        <SectionHeading command="history --career" />
        <div className="border-l-2 border-matrix/30 pl-6 space-y-8">
          {TIMELINE.map((entry, i) => (
            <ScrollFadeIn key={entry.period} delay={i * 150}>
              <div>
                <p className="font-mono text-xs text-matrix/70 mb-1">{entry.period}</p>
                <h3 className="text-base font-semibold text-foreground">{entry.role}</h3>
                <p className="text-sm text-foreground/60 mb-2">{entry.company}</p>
                <div className="flex flex-wrap gap-2">
                  {entry.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-matrix-dim px-2 py-0.5 font-mono text-[10px] text-matrix/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create Projects section**

```tsx
// apps/web/src/components/projects.tsx
import { ExternalLink, Github } from "lucide-react";

import { ScrollFadeIn } from "./scroll-fade-in";
import { SectionHeading } from "./section-heading";

interface Project {
  name: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
}

const PROJECTS: Project[] = [
  {
    name: "projekt-alpha",
    description: "Opis projektu alpha — co robi, jaki problem rozwiązuje.",
    tech: ["React", "TypeScript", "Three.js"],
    github: "https://github.com/",
    live: "https://example.com",
  },
  {
    name: "projekt-beta",
    description: "Opis projektu beta — co robi, jaki problem rozwiązuje.",
    tech: ["Node.js", "Docker", "PostgreSQL"],
    github: "https://github.com/",
  },
  {
    name: "projekt-gamma",
    description: "Opis projektu gamma — co robi, jaki problem rozwiązuje.",
    tech: ["Python", "FastAPI", "Redis"],
    github: "https://github.com/",
    live: "https://example.com",
  },
  {
    name: "projekt-delta",
    description: "Opis projektu delta — co robi, jaki problem rozwiązuje.",
    tech: ["Rust", "WASM", "WebGPU"],
    github: "https://github.com/",
  },
];

export function Projects() {
  return (
    <section id="projects" className="relative z-10 py-20 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="glass-panel rounded-xl border border-matrix-border p-8">
          <SectionHeading command="ls ~/projects" />
          <div className="grid gap-4 md:grid-cols-2">
            {PROJECTS.map((project, i) => (
              <ScrollFadeIn key={project.name} delay={i * 100}>
                <div className="group rounded-lg border border-matrix-border bg-[#0f0f0f] p-5 transition-all duration-300 hover:box-glow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-mono text-sm font-bold text-matrix">
                      {project.name}
                    </h3>
                    <div className="flex gap-2">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground/40 hover:text-matrix transition-colors"
                          aria-label={`GitHub repo for ${project.name}`}
                        >
                          <Github size={14} />
                        </a>
                      )}
                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground/40 hover:text-matrix transition-colors"
                          aria-label={`Live demo for ${project.name}`}
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-foreground/60 mb-3 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-matrix-dim px-2 py-0.5 font-mono text-[10px] text-matrix/70"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create BlogPreview section**

```tsx
// apps/web/src/components/blog-preview.tsx
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { ScrollFadeIn } from "./scroll-fade-in";
import { SectionHeading } from "./section-heading";

// Placeholder data — will be replaced with real blog loader in Task 9
const PREVIEW_POSTS = [
  {
    slug: "hello-world",
    title: "Jak zbudowałem ten landing w Three.js",
    date: "2026-04-10",
    readingTime: "5 min read",
  },
  {
    slug: "tanstack-start",
    title: "TanStack Start — moje doświadczenia",
    date: "2026-04-05",
    readingTime: "8 min read",
  },
];

export function BlogPreview() {
  return (
    <section id="blog" className="relative z-10 py-20 px-4">
      <div className="mx-auto max-w-3xl glass-panel rounded-xl border border-matrix-border p-8">
        <SectionHeading command="cat /blog/latest" />
        <div className="space-y-3">
          {PREVIEW_POSTS.map((post, i) => (
            <ScrollFadeIn key={post.slug} delay={i * 100}>
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="group flex items-center justify-between rounded-lg border border-matrix-border bg-[#0f0f0f] p-4 transition-all duration-300 hover:box-glow"
              >
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-matrix transition-colors">
                    {post.title}
                  </h3>
                  <p className="font-mono text-[10px] text-foreground/40 mt-1">
                    {post.date} · {post.readingTime}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="text-matrix/40 group-hover:text-matrix transition-colors"
                />
              </Link>
            </ScrollFadeIn>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-md border border-matrix-border px-4 py-2 font-mono text-xs text-matrix/70 hover:text-matrix hover:box-glow transition-all duration-300"
          >
            Wszystkie posty
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Create Contact form section**

```tsx
// apps/web/src/components/contact-form.tsx
import { Send } from "lucide-react";

import { ScrollFadeIn } from "./scroll-fade-in";
import { SectionHeading } from "./section-heading";

export function ContactForm() {
  return (
    <section id="contact" className="relative z-10 py-20 px-4 pb-32">
      <div className="mx-auto max-w-3xl glass-panel rounded-xl border border-matrix-border p-8">
        <SectionHeading command="mail --compose" />
        <ScrollFadeIn>
          <form
            action="mailto:your@email.com"
            method="POST"
            encType="text/plain"
            className="max-w-md space-y-4"
          >
            <div>
              <input
                type="email"
                name="email"
                placeholder="twoj@email.com"
                required
                className="w-full rounded-md border border-matrix-border bg-[#111] px-3 py-2 font-mono text-sm text-matrix caret-matrix placeholder:text-matrix/30 focus:outline-none focus:ring-1 focus:ring-matrix/50"
              />
            </div>
            <div>
              <input
                type="text"
                name="subject"
                placeholder="Temat"
                required
                className="w-full rounded-md border border-matrix-border bg-[#111] px-3 py-2 font-mono text-sm text-matrix caret-matrix placeholder:text-matrix/30 focus:outline-none focus:ring-1 focus:ring-matrix/50"
              />
            </div>
            <div>
              <textarea
                name="message"
                placeholder="Wiadomość..."
                rows={4}
                required
                className="w-full resize-none rounded-md border border-matrix-border bg-[#111] px-3 py-2 font-mono text-sm text-matrix caret-matrix placeholder:text-matrix/30 focus:outline-none focus:ring-1 focus:ring-matrix/50"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-md bg-matrix px-5 py-2.5 font-mono text-sm font-bold text-matrix-foreground transition-all duration-300 hover:box-glow"
            >
              <Send size={14} />
              WYŚLIJ
            </button>
          </form>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/hero.tsx apps/web/src/components/about.tsx apps/web/src/components/experience.tsx apps/web/src/components/projects.tsx apps/web/src/components/blog-preview.tsx apps/web/src/components/contact-form.tsx
git commit -m "add all landing page sections: hero, about, experience, projects, blog-preview, contact"
```

---

### Task 8: Wire up landing page and root layout

**Files:**
- Modify: `apps/web/src/routes/__root.tsx`
- Modify: `apps/web/src/routes/index.tsx`

- [ ] **Step 1: Update __root.tsx to include Matrix Canvas and Nav**

Update `apps/web/src/routes/__root.tsx` — add the lazy-loaded Matrix Canvas, Nav, and scroll/mouse binding:

```tsx
// apps/web/src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from "react";
import { Outlet, HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { lazy, Suspense, useEffect } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { Nav } from "@/components/nav";
import { bindScrollAndMouse } from "@/lib/scroll-store";

import "../index.css";

const MatrixCanvas = lazy(() =>
  import("@/components/matrix-canvas").then((m) => ({ default: m.MatrixCanvas })),
);

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "mm-landing" },
      { name: "description", content: "Personal developer portfolio" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  useEffect(() => {
    return bindScrollAndMouse();
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#0a0a0a] text-foreground font-sans antialiased overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          storageKey="vite-ui-theme"
        >
          {/* Three.js background — client only */}
          <Suspense fallback={null}>
            <MatrixCanvas />
          </Suspense>

          {/* Navigation */}
          <Nav />

          {/* Page content */}
          <main className="relative z-10">
            {children}
          </main>
        </ThemeProvider>
        <TanStackRouterDevtools position="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Rewrite index.tsx as landing page**

Replace `apps/web/src/routes/index.tsx`:

```tsx
// apps/web/src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";

import { About } from "@/components/about";
import { BlogPreview } from "@/components/blog-preview";
import { ContactForm } from "@/components/contact-form";
import { Experience } from "@/components/experience";
import { Hero } from "@/components/hero";
import { Projects } from "@/components/projects";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "tw0j_nick — Developer Portfolio" },
      {
        name: "description",
        content: "Full Stack Developer · Open Source · Matrix Enthusiast",
      },
    ],
  }),
});

function LandingPage() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <BlogPreview />
      <ContactForm />
    </>
  );
}
```

- [ ] **Step 3: Verify the full landing page**

```bash
cd apps/web && bun run dev
```

Expected: Dev server starts on port 3001. Page shows Matrix Rain 3D in the background, sticky nav at top, all 6 sections scroll vertically with fade-in animations. Typewriter effect plays in hero. Mouse movement causes subtle parallax on the rain.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/routes/__root.tsx apps/web/src/routes/index.tsx
git commit -m "wire up landing page with matrix canvas, nav, and all sections"
```

---

### Task 9: Blog infrastructure — MDX, routes, utilities

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/vite.config.ts`
- Create: `apps/web/src/lib/blog.ts`
- Create: `apps/web/src/content/blog/hello-world.mdx`
- Create: `apps/web/src/routes/blog/index.tsx`
- Create: `apps/web/src/routes/blog/$slug.tsx`

- [ ] **Step 1: Install MDX dependencies**

```bash
cd apps/web && bun add @mdx-js/rollup @mdx-js/react gray-matter rehype-pretty-code shiki remark-gfm remark-frontmatter
```

- [ ] **Step 2: Update vite.config.ts with MDX plugin**

Replace `apps/web/vite.config.ts`:

```ts
// apps/web/vite.config.ts
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import rehypePrettyCode from "rehype-pretty-code";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3001,
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    mdx({
      remarkPlugins: [remarkGfm, remarkFrontmatter],
      rehypePlugins: [
        [rehypePrettyCode, { theme: "github-dark" }],
      ],
    }),
    react(),
    nitro(),
  ],
});
```

- [ ] **Step 3: Create blog utilities**

```ts
// apps/web/src/lib/blog.ts
import matter from "gray-matter";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: string;
  content: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: string;
}

/** Estimate reading time from raw content */
function estimateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

/** Parse frontmatter from raw MDX string */
export function parseFrontmatter(
  raw: string,
  slug: string,
): BlogPostMeta {
  const { data, content } = matter(raw);
  return {
    slug,
    title: (data.title as string) ?? slug,
    date: (data.date as string) ?? "unknown",
    description: (data.description as string) ?? "",
    tags: (data.tags as string[]) ?? [],
    readingTime: estimateReadingTime(content),
  };
}

/**
 * Load all blog post metadata at build time.
 * Uses Vite's import.meta.glob to find all .mdx files.
 */
export async function getAllPosts(): Promise<BlogPostMeta[]> {
  const modules = import.meta.glob("/src/content/blog/*.mdx", {
    query: "?raw",
    import: "default",
  });

  const posts: BlogPostMeta[] = [];

  for (const [path, loader] of Object.entries(modules)) {
    const raw = (await loader()) as string;
    const slug = path.split("/").pop()!.replace(".mdx", "");
    posts.push(parseFrontmatter(raw, slug));
  }

  // Sort by date descending
  posts.sort((a, b) => (a.date > b.date ? -1 : 1));

  return posts;
}
```

- [ ] **Step 4: Create sample blog post**

```bash
mkdir -p apps/web/src/content/blog
```

```mdx
---
title: "Jak zbudowałem ten landing w Three.js"
date: "2026-04-10"
description: "Historia budowy portfolio z Matrix Rain efektem w Three.js i TanStack Start."
tags: ["three.js", "react", "tanstack-start"]
---

# Jak zbudowałem ten landing w Three.js

Cześć! To jest mój pierwszy post na blogu. Opowiem jak powstała ta strona.

## Stack technologiczny

- **TanStack Start** — SSR framework na bazie TanStack Router
- **React Three Fiber** — deklaratywny wrapper na Three.js
- **Tailwind CSS v4** — utility-first CSS

## Matrix Rain

Efekt Matrix Rain jest zbudowany z `InstancedMesh` — renderuje setki znaków w jednym draw callu:

```typescript
const TOTAL_CHARS = COLUMN_COUNT * CHARS_PER_COLUMN;

function MatrixRain() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useFrame((state, delta) => {
    // Update each instance position
    for (let i = 0; i < TOTAL_CHARS; i++) {
      // ... rain logic
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, TOTAL_CHARS]}>
      <planeGeometry args={[0.5, 0.8]} />
      <meshBasicMaterial color="#00ff41" transparent />
    </instancedMesh>
  );
}
```

## Co dalej?

Planuję dodać więcej efektów i sekcji. Stay tuned!
```

Save this as `apps/web/src/content/blog/hello-world.mdx`.

- [ ] **Step 5: Create blog list route**

```tsx
// apps/web/src/routes/blog/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { ScrollFadeIn } from "@/components/scroll-fade-in";
import { getAllPosts } from "@/lib/blog";

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    const posts = await getAllPosts();
    return { posts };
  },
  head: () => ({
    meta: [
      { title: "Blog — tw0j_nick" },
      { name: "description", content: "Posty o programowaniu, technologii i open source." },
    ],
  }),
  component: BlogList,
});

function BlogList() {
  const { posts } = Route.useLoaderData();

  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20 px-4">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1 font-mono text-xs text-matrix/60 hover:text-matrix mb-8 transition-colors"
        >
          <ArrowLeft size={12} />
          Powrót
        </Link>

        <div className="glass-panel rounded-xl border border-matrix-border p-8">
          <SectionHeading command="ls /blog" />

          {posts.length === 0 && (
            <p className="text-sm text-foreground/50 font-mono">Brak postów... jeszcze.</p>
          )}

          <div className="space-y-3">
            {posts.map((post, i) => (
              <ScrollFadeIn key={post.slug} delay={i * 80}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group flex items-center justify-between rounded-lg border border-matrix-border bg-[#0f0f0f] p-4 transition-all duration-300 hover:box-glow"
                >
                  <div>
                    <h2 className="text-sm font-semibold text-foreground group-hover:text-matrix transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-xs text-foreground/50 mt-1">{post.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-mono text-[10px] text-foreground/40">
                        {post.date}
                      </span>
                      <span className="font-mono text-[10px] text-foreground/40">
                        {post.readingTime}
                      </span>
                      <div className="flex gap-1">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-matrix-dim px-1.5 py-0.5 font-mono text-[9px] text-matrix/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-matrix/30 group-hover:text-matrix transition-colors flex-shrink-0"
                  />
                </Link>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create blog post route**

```tsx
// apps/web/src/routes/blog/$slug.tsx
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { parseFrontmatter } from "@/lib/blog";

// Eagerly import all mdx modules and their raw sources
const mdxModules = import.meta.glob("/src/content/blog/*.mdx");
const mdxRaw = import.meta.glob("/src/content/blog/*.mdx", {
  query: "?raw",
  import: "default",
});

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { slug } = params;
    const modulePath = `/src/content/blog/${slug}.mdx`;

    const loadModule = mdxModules[modulePath];
    const loadRaw = mdxRaw[modulePath];

    if (!loadModule || !loadRaw) {
      throw notFound();
    }

    const [mod, raw] = await Promise.all([
      loadModule() as Promise<{ default: React.ComponentType }>,
      loadRaw() as Promise<string>,
    ]);

    const meta = parseFrontmatter(raw, slug);

    return {
      Component: mod.default,
      meta,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.meta.title ?? "Post"} — tw0j_nick` },
      { name: "description", content: loaderData?.meta.description ?? "" },
    ],
  }),
  component: BlogPost,
  notFoundComponent: () => (
    <div className="relative z-10 min-h-screen flex items-center justify-center">
      <p className="font-mono text-matrix/60">Post nie znaleziony.</p>
    </div>
  ),
});

function BlogPost() {
  const { Component, meta } = Route.useLoaderData();

  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20 px-4">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1 font-mono text-xs text-matrix/60 hover:text-matrix mb-8 transition-colors"
        >
          <ArrowLeft size={12} />
          Wszystkie posty
        </Link>

        <article className="glass-panel rounded-xl border border-matrix-border p-8">
          <SectionHeading command={`cat /blog/${meta.slug}`} />

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">{meta.title}</h1>
            <div className="flex items-center gap-3 font-mono text-xs text-foreground/40">
              <span>{meta.date}</span>
              <span>{meta.readingTime}</span>
            </div>
            <div className="flex gap-1.5 mt-2">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-matrix-dim px-2 py-0.5 font-mono text-[10px] text-matrix/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="prose prose-invert prose-sm max-w-none prose-headings:font-mono prose-headings:text-matrix prose-code:text-matrix prose-a:text-matrix prose-pre:bg-[#0d0d0d] prose-pre:border prose-pre:border-matrix-border">
            <Component />
          </div>
        </article>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Add @tailwindcss/typography for prose classes**

```bash
cd apps/web && bun add @tailwindcss/typography
```

Then add the import at the top of `packages/ui/src/styles/globals.css` (after the existing imports):

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@plugin "@tailwindcss/typography";
```

- [ ] **Step 8: Create blog route directory**

```bash
mkdir -p apps/web/src/routes/blog
```

- [ ] **Step 9: Verify blog works**

```bash
cd apps/web && bun run dev
```

Expected: Navigate to `http://localhost:3001/blog` — see the post list. Click on "Jak zbudowałem ten landing w Three.js" — see the full post with syntax highlighted code blocks.

- [ ] **Step 10: Commit**

```bash
git add apps/web/src/lib/blog.ts apps/web/src/content/blog/hello-world.mdx apps/web/src/routes/blog/ apps/web/vite.config.ts apps/web/package.json packages/ui/src/styles/globals.css
git commit -m "add MDX-powered blog with routes, syntax highlighting, and sample post"
```

---

### Task 10: Connect BlogPreview to real data

**Files:**
- Modify: `apps/web/src/components/blog-preview.tsx`
- Modify: `apps/web/src/routes/index.tsx`

- [ ] **Step 1: Update index.tsx to load blog posts in loader**

```tsx
// apps/web/src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";

import { About } from "@/components/about";
import { BlogPreview } from "@/components/blog-preview";
import { ContactForm } from "@/components/contact-form";
import { Experience } from "@/components/experience";
import { Hero } from "@/components/hero";
import { Projects } from "@/components/projects";
import { getAllPosts } from "@/lib/blog";

export const Route = createFileRoute("/")({
  loader: async () => {
    const posts = await getAllPosts();
    return { posts: posts.slice(0, 3) };
  },
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "tw0j_nick — Developer Portfolio" },
      {
        name: "description",
        content: "Full Stack Developer · Open Source · Matrix Enthusiast",
      },
    ],
  }),
});

function LandingPage() {
  const { posts } = Route.useLoaderData();

  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <BlogPreview posts={posts} />
      <ContactForm />
    </>
  );
}
```

- [ ] **Step 2: Update BlogPreview to accept posts prop**

```tsx
// apps/web/src/components/blog-preview.tsx
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import type { BlogPostMeta } from "@/lib/blog";

import { ScrollFadeIn } from "./scroll-fade-in";
import { SectionHeading } from "./section-heading";

interface BlogPreviewProps {
  posts: BlogPostMeta[];
}

export function BlogPreview({ posts }: BlogPreviewProps) {
  return (
    <section id="blog" className="relative z-10 py-20 px-4">
      <div className="mx-auto max-w-3xl glass-panel rounded-xl border border-matrix-border p-8">
        <SectionHeading command="cat /blog/latest" />

        {posts.length === 0 ? (
          <p className="text-sm text-foreground/50 font-mono">Brak postów... jeszcze.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <ScrollFadeIn key={post.slug} delay={i * 100}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group flex items-center justify-between rounded-lg border border-matrix-border bg-[#0f0f0f] p-4 transition-all duration-300 hover:box-glow"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-matrix transition-colors">
                      {post.title}
                    </h3>
                    <p className="font-mono text-[10px] text-foreground/40 mt-1">
                      {post.date} · {post.readingTime}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-matrix/40 group-hover:text-matrix transition-colors"
                  />
                </Link>
              </ScrollFadeIn>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-md border border-matrix-border px-4 py-2 font-mono text-xs text-matrix/70 hover:text-matrix hover:box-glow transition-all duration-300"
          >
            Wszystkie posty
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/routes/index.tsx apps/web/src/components/blog-preview.tsx
git commit -m "connect blog preview to real MDX post data via loader"
```

---

### Task 11: Polish — responsive, animations, final cleanup

**Files:**
- Modify: `apps/web/src/components/matrix-rain.tsx`
- Modify: `apps/web/src/components/nav.tsx`
- Delete: `apps/web/src/components/loader.tsx` (if unused)

- [ ] **Step 1: Add responsive particle reduction to matrix-rain.tsx**

Add these lines at the top of the `MatrixRain` component function, before the `useMemo` calls, and use the adjusted count:

```tsx
// At the top of MatrixRain component, add:
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
const columnCount = isMobile ? 25 : COLUMN_COUNT;
const charsPerColumn = isMobile ? 12 : CHARS_PER_COLUMN;
const totalChars = columnCount * charsPerColumn;
```

Then update all references to `COLUMN_COUNT`, `CHARS_PER_COLUMN`, and `TOTAL_CHARS` within the component to use the local `columnCount`, `charsPerColumn`, and `totalChars` variables. Also update the `instancedMesh` args:

```tsx
<instancedMesh ref={meshRef} args={[undefined, undefined, totalChars]}>
```

- [ ] **Step 2: Add smooth scroll CSS**

Add to the end of `apps/web/src/index.css`:

```css
html {
  scroll-behavior: smooth;
}
```

- [ ] **Step 3: Verify on mobile viewport**

Open Chrome DevTools, toggle device toolbar (Ctrl+Shift+M), test at 375px width:
- Nav should show hamburger menu
- All sections should be single column
- Matrix Rain should have fewer particles
- Everything should be readable and touchable

- [ ] **Step 4: Final verification — full page check**

```bash
cd apps/web && bun run dev
```

Verify:
1. Matrix Rain 3D animates in background
2. Mouse movement causes parallax
3. Scrolling changes rain density
4. All sections render with glass panels
5. Typewriter effect plays on hero tagline
6. Timeline entries fade in on scroll
7. Project cards glow on hover
8. Blog list page works at `/blog`
9. Blog post page works at `/blog/hello-world`
10. Nav links smooth-scroll to sections

- [ ] **Step 5: Commit**

```bash
git add -A apps/web/
git commit -m "add responsive matrix rain, smooth scroll, final polish"
```

---

### Task 12: Add .superpowers to .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add .superpowers directory to root .gitignore**

Append to `.gitignore`:

```
# Brainstorm visual companion
.superpowers/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "add .superpowers to gitignore"
```
