import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: string;
}

/** Estimate reading time from raw content */
function estimateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

/**
 * Load all blog post metadata.
 * Wrapped in createServerFn so Node-only imports (fs, path, gray-matter)
 * are stripped from the client bundle.
 */
export const getAllPosts = createServerFn({ method: "GET" }).handler(async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const matter = (await import("gray-matter")).default;

  const contentDir = path.resolve(import.meta.dirname!, "../content/blog");

  if (!fs.existsSync(contentDir)) {
    return [] as BlogPostMeta[];
  }

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

  const posts: BlogPostMeta[] = files.map((file) => {
    const raw = fs.readFileSync(path.join(contentDir, file), "utf-8");
    const slug = file.replace(".mdx", "");
    const { data, content } = matter(raw);
    return {
      slug,
      title: (data.title as string) ?? slug,
      date: (data.date as string) ?? "unknown",
      description: (data.description as string) ?? "",
      tags: (data.tags as string[]) ?? [],
      readingTime: estimateReadingTime(content),
    };
  });

  // Sort by date descending
  posts.sort((a, b) => (a.date > b.date ? -1 : 1));

  return posts;
});

/**
 * Load a single post's metadata by slug.
 * Server-only: reads the MDX file from disk and extracts frontmatter.
 */
export const getPostMeta = createServerFn({ method: "GET" })
  .inputValidator(z.string())
  .handler(async ({ data: slug }) => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const matter = (await import("gray-matter")).default;

    const filePath = path.resolve(import.meta.dirname!, "../content/blog", `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    return {
      slug,
      title: (data.title as string) ?? slug,
      date: (data.date as string) ?? "unknown",
      description: (data.description as string) ?? "",
      tags: (data.tags as string[]) ?? [],
      readingTime: estimateReadingTime(content),
    } satisfies BlogPostMeta;
  });
