'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

interface MarkdownBlockEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MIN_HEIGHT = 200;
const MAX_HEIGHT = 800;
const LINE_HEIGHT = 22; // Approximate line height in pixels
const PADDING = 80; // Toolbar + padding

export default function MarkdownBlockEditor({
  content,
  onChange,
}: MarkdownBlockEditorProps) {
  // Calculate height based on content
  const calculatedHeight = useMemo(() => {
    const lineCount = (content.match(/\n/g) || []).length + 1;
    const contentHeight = lineCount * LINE_HEIGHT + PADDING;
    return Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, contentHeight));
  }, [content]);

  return (
    <div data-color-mode="auto">
      <MDEditor
        value={content}
        onChange={(value) => onChange(value || '')}
        preview="edit"
        height={calculatedHeight}
        visibleDragbar={true}
      />
    </div>
  );
}
