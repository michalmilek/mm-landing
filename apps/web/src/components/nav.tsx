import { Link, useRouter } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { LanguageToggle } from "./language-toggle";
import { cn } from "@mm-landing/ui/lib/utils";
import { useLanguageStore } from "@/lib/language-store";

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { t } = useLanguageStore();

  const sections = [
    { id: "about", label: t.nav.about },
    { id: "experience", label: t.nav.experience },
    { id: "projects", label: t.nav.projects },
    { id: "blog", label: t.nav.blog },
    { id: "contact", label: t.nav.contact },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback(
    async (id: string) => {
      // If on a different page, navigate home first
      if (router.state.location.pathname !== "/") {
        await router.navigate({ to: "/" });
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
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
          &lt;michalmilek /&gt;
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {sections.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                void scrollToSection(id);
              }}
              className="font-mono text-xs text-matrix/70 hover:text-matrix transition-colors"
            >
              {label}
            </button>
          ))}
          <LanguageToggle />
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
          {sections.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                void scrollToSection(id);
              }}
              className="font-mono text-sm text-matrix/70 hover:text-matrix text-left transition-colors"
            >
              &gt; {label}
            </button>
          ))}
          <LanguageToggle />
        </div>
      )}
    </nav>
  );
}
