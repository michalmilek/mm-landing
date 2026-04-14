import { ArrowRight } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog";
import { Link } from "@tanstack/react-router";
import { ScrollFadeIn } from "./scroll-fade-in";
import { SectionHeading } from "./section-heading";
import { useLanguageStore } from "@/lib/language-store";

interface BlogPreviewProps {
  posts: BlogPostMeta[];
}

export function BlogPreview({ posts }: BlogPreviewProps) {
  const { t } = useLanguageStore();

  return (
    <section id="blog" className="relative z-10 py-20 px-4">
      <div className="mx-auto max-w-3xl glass-panel rounded-xl border border-matrix-border p-8">
        <SectionHeading command="cat /blog/latest" />
        {posts.length === 0 ? (
          <p className="text-center text-foreground/60 py-8">{t.blog.noPosts}</p>
        ) : (
          <>
            <div className="space-y-3">
              {posts.map((post, i) => (
                <ScrollFadeIn key={post.slug} delay={i * 100}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="group flex items-center justify-between rounded-lg border border-matrix-border bg-[#0f0f0f] p-4 transition-all duration-300 hover:box-glow"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-matrix transition-colors">
                        {post.title}
                      </h3>
                      <p className="font-mono text-[10px] text-foreground/40 mt-1">
                        {post.date} · {post.readingTime}
                      </p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-matrix/40 group-hover:text-matrix transition-colors"
                    />
                  </Link>
                </ScrollFadeIn>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 rounded-md border border-matrix-border px-4 py-2 font-mono text-xs text-matrix/70 hover:text-matrix hover:box-glow transition-all duration-300"
              >
                {t.blog.allPosts}
                <ArrowRight size={12} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
