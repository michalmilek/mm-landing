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
    period: "2023 — teraz",
    role: "Frontend Developer",
    company: "Projekty komercyjne & freelance",
    tech: ["React", "Next.js", "TypeScript", "Tailwind CSS", "React Native"],
  },
  {
    period: "2022 — 2023",
    role: "Full Stack Developer",
    company: "Projekty z Angular, Vue, NestJS",
    tech: ["Angular", "Vue", "Nuxt", "NestJS", "Docker", "SQL"],
  },
  {
    period: "2021 — 2022",
    role: "Junior Developer",
    company: "Nauka & pierwsze projekty",
    tech: ["JavaScript", "React", "Laravel", "PHP", "MySQL"],
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
