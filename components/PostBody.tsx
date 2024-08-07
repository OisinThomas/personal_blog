import markdownStyles from "./markdown-styles.module.css";

export function PostBody({ content }: { content: any }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={markdownStyles["markdown"]}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}