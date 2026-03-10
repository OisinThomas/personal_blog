'use client';

import { Highlight, themes } from 'prism-react-renderer';

interface CodeBlockProps {
  content: string;
  metadata?: {
    language?: string;
    filename?: string;
    showLineNumbers?: boolean;
  };
}

export default function CodeBlock({ content, metadata }: CodeBlockProps) {
  const language = metadata?.language || 'text';
  const filename = metadata?.filename;
  const showLineNumbers = metadata?.showLineNumbers ?? false;

  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-card-border shadow-soft">
      {filename && (
        <div className="bg-surface-2 text-secondary-500 px-4 py-2 text-sm border-b border-card-border flex items-center justify-between">
          <span>{filename}</span>
          {language !== 'text' && (
            <span className="text-xs px-2 py-0.5 rounded bg-surface-1 text-secondary-400">
              {language}
            </span>
          )}
        </div>
      )}
      {!filename && language !== 'text' && (
        <div className="bg-surface-2 px-4 py-1.5 border-b border-card-border flex justify-end">
          <span className="text-xs px-2 py-0.5 rounded bg-surface-1 text-secondary-400">
            {language}
          </span>
        </div>
      )}
      <Highlight theme={themes.nightOwl} code={content} language={language}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="p-4 overflow-x-auto text-sm leading-relaxed"
            style={{ ...style, margin: 0 }}
          >
            <code>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {showLineNumbers && (
                    <span className="inline-block w-8 pr-4 text-right select-none opacity-40">
                      {i + 1}
                    </span>
                  )}
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
