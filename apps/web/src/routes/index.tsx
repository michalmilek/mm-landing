import { About } from "@/components/about";
import { BlogPreview } from "@/components/blog-preview";
import { ContactForm } from "@/components/contact-form";
import { Experience } from "@/components/experience";
import { Hero } from "@/components/hero";
import { Projects } from "@/components/projects";
import { createFileRoute } from "@tanstack/react-router";
import { getAllPosts } from "@/lib/blog";

export const Route = createFileRoute("/")({
  component: LandingPage,
  loader: async () => {
    const posts = await getAllPosts();
    return { posts: posts.slice(0, 3) };
  },
  head: () => ({
    meta: [
      { title: "Michał Miłek — Fullstack Developer" },
      {
        name: "description",
        content: "Fullstack Developer · React · TypeScript · Poland",
      },
    ],
  }),
});

function LandingPage() {
  const { posts } = Route.useLoaderData();

  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <BlogPreview posts={posts} />
      <ContactForm />
    </>
  );
}
