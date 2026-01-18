import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
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
