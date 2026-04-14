import { Github, Linkedin } from "lucide-react";

import { Typewriter } from "./typewriter";
import { useLanguageStore } from "@/lib/language-store";

const SOCIAL_LINKS = [
  { icon: Github, href: "https://github.com/michalmilek", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/michał-miłek-805011247", label: "LinkedIn" },
] as const;

export function Hero() {
  const { t } = useLanguageStore();

  return (
    <section
      id="hero"
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center"
    >
      <h1 className="font-mono text-5xl md:text-7xl font-bold text-matrix text-glow mb-3">
        michalmilek
      </h1>
      <p className="text-lg text-foreground/70 mb-4">Michał Miłek</p>
      <div className="text-sm text-matrix/80 mb-8 h-6">
        <Typewriter text={t.hero.tagline} speed={40} delay={500} />
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
