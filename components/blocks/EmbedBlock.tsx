'use client';

import { useRef, useEffect } from 'react';

interface EmbedBlockProps {
  content: string | null;
  metadata?: {
    provider?: string;
    url?: string;
    html?: string;
  };
}

export default function EmbedBlock({ content, metadata }: EmbedBlockProps) {
  // If we have raw HTML, render it and execute any script tags
  if (metadata?.html) {
    return (
      <RawHtmlEmbed html={metadata.html} />
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

function RawHtmlEmbed({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Inject HTML client-side only to avoid hydration mismatch
    // (embed scripts like Tenor mutate the DOM before React hydrates)
    container.innerHTML = html;

    // Find script tags and re-create them so the browser executes them
    const scripts = container.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      if (oldScript.textContent) {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    return () => {
      container.innerHTML = '';
    };
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="my-8 overflow-hidden rounded-lg"
    />
  );
}
