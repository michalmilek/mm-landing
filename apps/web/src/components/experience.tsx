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
    period: "kwi 2025 — teraz",
    role: "Frontend Developer",
    company: "Ideo Software",
    tech: ["React", "TypeScript", "Tailwind CSS"],
  },
  {
    period: "cze 2024 — mar 2025",
    role: "Frontend Developer",
    company: "Seth Software",
    tech: ["React", "TypeScript", "Next.js"],
  },
  {
    period: "mar 2024 — maj 2024",
    role: "Intern — Junior Frontend Developer",
    company: "Seth Software",
    tech: ["React", "TypeScript"],
  },
  {
    period: "lip 2023 — wrz 2023",
    role: "Praktykant — React Developer",
    company: "Mobitouch",
    tech: ["React", "JavaScript"],
  },
  {
    period: "mar 2023 — kwi 2023",
    role: "Praktykant — React Developer",
    company: "Mobitouch",
    tech: ["React", "JavaScript"],
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
