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
