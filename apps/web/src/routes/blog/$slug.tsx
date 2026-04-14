import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { parseFrontmatter } from "@/lib/blog";

// Eagerly import all mdx modules and their raw sources
const mdxModules = import.meta.glob("/src/content/blog/*.mdx");
const mdxRaw = import.meta.glob("/src/content/blog/*.mdx", {
  query: "?raw",
  import: "default",
});

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { slug } = params;
    const modulePath = `/src/content/blog/${slug}.mdx`;

    const loadModule = mdxModules[modulePath];
    const loadRaw = mdxRaw[modulePath];

    if (!loadModule || !loadRaw) {
      throw notFound();
    }

    const [mod, raw] = await Promise.all([
      loadModule() as Promise<{ default: React.ComponentType }>,
      loadRaw() as Promise<string>,
    ]);

    const meta = parseFrontmatter(raw, slug);

    return {
      Component: mod.default,
      meta,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.meta.title ?? "Post"} — tw0j_nick` },
      { name: "description", content: loaderData?.meta.description ?? "" },
    ],
  }),
  component: BlogPost,
  notFoundComponent: () => (
    <div className="relative z-10 min-h-screen flex items-center justify-center">
      <p className="font-mono text-matrix/60">Post nie znaleziony.</p>
    </div>
  ),
});

function BlogPost() {
  const { Component, meta } = Route.useLoaderData();

  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20 px-4">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1 font-mono text-xs text-matrix/60 hover:text-matrix mb-8 transition-colors"
        >
          <ArrowLeft size={12} />
          Wszystkie posty
        </Link>

        <article className="glass-panel rounded-xl border border-matrix-border p-8">
          <SectionHeading command={`cat /blog/${meta.slug}`} />

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">{meta.title}</h1>
            <div className="flex items-center gap-3 font-mono text-xs text-foreground/40">
              <span>{meta.date}</span>
              <span>{meta.readingTime}</span>
            </div>
            <div className="flex gap-1.5 mt-2">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-matrix-dim px-2 py-0.5 font-mono text-[10px] text-matrix/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="prose prose-invert prose-sm max-w-none prose-headings:font-mono prose-headings:text-matrix prose-code:text-matrix prose-a:text-matrix prose-pre:bg-[#0d0d0d] prose-pre:border prose-pre:border-matrix-border">
            <Component />
          </div>
        </article>
      </div>
    </div>
  );
}
