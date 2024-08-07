import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";
import { remark } from "remark";
import remarkCallout from "@r4ai/remark-callout";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkParse)
    .use(remarkCallout)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .processSync(markdown);
  return result.toString();
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs(): string[] {
  try {
    return fs.readdirSync(postsDirectory);
  } catch {
    return [];
  }
}

export interface PostData {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  image?: string;
  majorTag?: string;
  subTag?: string;
  language: string;
  tags: string[];
  slug: string;
  content: string;
  [key: string]: any;  // For any additional fields
}

export function getPostBySlug(slug: string): Partial<PostData> {
  try {
    const realSlug = slug.replace(/\.md$/, "");
    const fullPath = join(postsDirectory, `${realSlug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return { ...data, slug: realSlug, content } as PostData;
  } catch {
    return {};
  }
}

export function getAllPosts(): PostData[] {
  const slugs = getPostSlugs();
  if (!slugs.length) {
    return [];
  }
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is PostData => !!post.publishedAt)
    .sort((post1, post2) => 
      new Date(post2.publishedAt).getTime() - new Date(post1.publishedAt).getTime()
    );
  return posts;
}