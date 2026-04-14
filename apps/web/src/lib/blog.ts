import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

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

/** Parse frontmatter from raw MDX string */
export function parseFrontmatter(raw: string, slug: string): BlogPostMeta {
  const { data, content } = matter(raw);
  return {
    slug,
    title: (data.title as string) ?? slug,
    date: (data.date as string) ?? "unknown",
    description: (data.description as string) ?? "",
    tags: (data.tags as string[]) ?? [],
    readingTime: estimateReadingTime(content),
  };
}

/**
 * Load all blog post metadata.
 * Reads .mdx files directly from the filesystem (runs server-side in loaders).
 */
export function getAllPosts(): BlogPostMeta[] {
  const contentDir = path.resolve(import.meta.dirname, "../content/blog");

  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

  const posts: BlogPostMeta[] = files.map((file) => {
    const raw = fs.readFileSync(path.join(contentDir, file), "utf-8");
    const slug = file.replace(".mdx", "");
    return parseFrontmatter(raw, slug);
  });

  // Sort by date descending
  posts.sort((a, b) => (a.date > b.date ? -1 : 1));

  return posts;
}
