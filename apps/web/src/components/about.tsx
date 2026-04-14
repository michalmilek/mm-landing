import { useLanguageStore } from "@/lib/language-store";
import { ScrollFadeIn } from "./scroll-fade-in";
import { SectionHeading } from "./section-heading";

export function About() {
  const { t } = useLanguageStore();

  return (
    <section id="about" className="relative z-10 py-20 px-4">
      <div className="mx-auto max-w-3xl glass-panel rounded-xl border border-matrix-border p-8">
        <SectionHeading command="whoami" />
        <ScrollFadeIn>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4 text-foreground/80 leading-relaxed">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
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
