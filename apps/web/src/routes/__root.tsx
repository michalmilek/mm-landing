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
      { title: "Michał Miłek — Fullstack Developer" },
      { name: "description", content: "Personal developer portfolio" },
    ],
    links: [{ rel: "icon", href: "/favicon.ico" }],
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
      <body className="bg-background text-foreground font-sans antialiased overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          storageKey="mm-landing-theme"
        >
          {/* Three.js background — client only */}
          <Suspense fallback={null}>
            <MatrixCanvas />
          </Suspense>

          {/* Navigation */}
          <Nav />

          {/* Page content */}
          <main className="relative z-10">{children}</main>
        </ThemeProvider>
        <TanStackRouterDevtools position="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
