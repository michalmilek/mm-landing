import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { ScrollFadeIn } from "@/components/scroll-fade-in";
import { SectionHeading } from "@/components/section-heading";
import { getAllPosts } from "@/lib/blog";

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    const posts = await getAllPosts();
    return { posts };
  },
  head: () => ({
    meta: [
      { title: "Blog — michalmilek" },
      { name: "description", content: "Posty o programowaniu, technologii i open source." },
    ],
  }),
  component: BlogList,
});

function BlogList() {
  const { posts } = Route.useLoaderData();

  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20 px-4">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1 font-mono text-xs text-matrix/60 hover:text-matrix mb-8 transition-colors"
        >
          <ArrowLeft size={12} />
          Powrót
        </Link>

        <div className="glass-panel rounded-xl border border-matrix-border p-8">
          <SectionHeading command="ls /blog" />

          {posts.length === 0 && (
            <p className="text-sm text-foreground/50 font-mono">Brak postów... jeszcze.</p>
          )}

          <div className="space-y-3">
            {posts.map((post, i) => (
              <ScrollFadeIn key={post.slug} delay={i * 80}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group flex items-center justify-between rounded-lg border border-matrix-border bg-[#0f0f0f] p-4 transition-all duration-300 hover:box-glow"
                >
                  <div>
                    <h2 className="text-sm font-semibold text-foreground group-hover:text-matrix transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-xs text-foreground/50 mt-1">{post.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-mono text-[10px] text-foreground/40">{post.date}</span>
                      <span className="font-mono text-[10px] text-foreground/40">
                        {post.readingTime}
                      </span>
                      <div className="flex gap-1">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-matrix-dim px-1.5 py-0.5 font-mono text-[9px] text-matrix/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-matrix/30 group-hover:text-matrix transition-colors flex-shrink-0"
                  />
                </Link>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
