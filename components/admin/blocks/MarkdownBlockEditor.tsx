'use client';

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

export default function MarkdownBlockEditor({
  content,
  onChange,
}: MarkdownBlockEditorProps) {
  return (
    <div data-color-mode="auto">
      <MDEditor
        value={content}
        onChange={(value) => onChange(value || '')}
        preview="edit"
        height={400}
        visibleDragbar={false}
      />
    </div>
  );
}
