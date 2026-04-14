import { ExternalLink, Github } from "lucide-react";

import { useLanguageStore } from "@/lib/language-store";
import { ScrollFadeIn } from "./scroll-fade-in";
import { SectionHeading } from "./section-heading";

interface Project {
  name: string;
  tech: string[];
  github?: string;
  live?: string;
}

const PROJECTS: Project[] = [
  {
    name: "laravel-react",
    tech: ["Laravel", "React", "TypeScript"],
    github: "https://github.com/michalmilek/laravel-react",
  },
  {
    name: "music-player",
    tech: ["React", "TypeScript", "Tailwind CSS"],
    github: "https://github.com/michalmilek/music-player",
  },
  {
    name: "portfolio-neobrutalism",
    tech: ["React", "CSS", "Neobrutalism"],
    github: "https://github.com/michalmilek/portfolio-neobrutalism",
  },
  {
    name: "mm-landing",
    tech: ["React", "Three.js", "TanStack Start", "Tailwind"],
    github: "https://github.com/michalmilek/mm-landing",
  },
];

export function Projects() {
  const { t } = useLanguageStore();

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
                    <h3 className="font-mono text-sm font-bold text-matrix">{project.name}</h3>
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
                    {t.projects.descriptions[project.name as keyof typeof t.projects.descriptions]}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="rounded bg-matrix-dim px-2 py-0.5 font-mono text-[10px] text-matrix/70"
                      >
                        {tech}
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
