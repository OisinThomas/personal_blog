import { markdownToHtml } from '@/lib/utils';
import styles from '@/components/markdown-styles.module.css';

interface MarkdownBlockProps {
  content: string;
}

export default async function MarkdownBlock({ content }: MarkdownBlockProps) {
  const html = await markdownToHtml(content);

  return (
    <div
      className={`${styles.markdown} prose prose-lg dark:prose-invert max-w-none
        prose-headings:font-semibold
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:my-4
        prose-a:text-blue-600 dark:prose-a:text-blue-400
        prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-lg prose-img:shadow-md
        prose-code:before:content-none prose-code:after:content-none
        prose-code:bg-slate-200 dark:prose-code:bg-gray-800
        prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-slate-900 prose-pre:text-slate-100
        [&_pre_code]:bg-transparent [&_pre_code]:p-0
        prose-blockquote:border-l-blue-500
        prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
        prose-blockquote:py-1 prose-blockquote:px-4
        prose-blockquote:not-italic
        [&_blockquote_p:first-of-type]:before:content-none
        [&_blockquote_p:last-of-type]:after:content-none`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
