import matter from "gray-matter";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: string;
  content: string;
}

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
 * Load all blog post metadata at build time.
 * Uses Vite's import.meta.glob to find all .mdx files.
 */
export async function getAllPosts(): Promise<BlogPostMeta[]> {
  const modules = import.meta.glob("/src/content/blog/*.mdx", {
    query: "?raw",
    import: "default",
  });

  const posts: BlogPostMeta[] = [];

  for (const [path, loader] of Object.entries(modules)) {
    const raw = (await loader()) as string;
    const slug = path.split("/").pop()!.replace(".mdx", "");
    posts.push(parseFrontmatter(raw, slug));
  }

  // Sort by date descending
  posts.sort((a, b) => (a.date > b.date ? -1 : 1));

  return posts;
}
