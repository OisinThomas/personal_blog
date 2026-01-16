interface EmbedBlockProps {
  content: string | null;
  metadata?: {
    provider?: string;
    url?: string;
    html?: string;
  };
}

export default function EmbedBlock({ content, metadata }: EmbedBlockProps) {
  // If we have raw HTML, render it directly
  if (metadata?.html) {
    return (
      <div
        className="my-8 overflow-hidden rounded-lg"
        dangerouslySetInnerHTML={{ __html: metadata.html }}
      />
    );
  }

  // If we have a URL, render as iframe
  const url = metadata?.url || content;

  if (!url) {
    return null;
  }

  return (
    <div className="my-8 overflow-hidden rounded-lg shadow-md">
      <iframe
        src={url}
        title="Embedded content"
        className="w-full min-h-[400px] border-0"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
