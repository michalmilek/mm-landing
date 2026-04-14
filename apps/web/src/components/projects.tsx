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
