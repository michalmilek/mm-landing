/// <reference types="vite/client" />
import "../index.css";
import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { type ReactNode, Suspense, lazy, useEffect } from "react";
import { Nav } from "@/components/nav";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import { bindScrollAndMouse } from "@/lib/scroll-store";

const MatrixCanvas = lazy(async () => {
  const m = await import("@/components/matrix-canvas");
  return { default: m.MatrixCanvas };
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf8" },
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
  useEffect(() => bindScrollAndMouse(), []);

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
