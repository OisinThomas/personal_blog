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

  const lines = content.split('\n');

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-card-border shadow-soft">
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
      <pre className="bg-slate-900 text-slate-100 p-4 overflow-x-auto">
        <code className={`language-${language}`}>
          {showLineNumbers
            ? lines.map((line, i) => (
                <div key={i} className="table-row">
                  <span className="table-cell text-slate-500 pr-4 select-none text-right w-8 text-sm">
                    {i + 1}
                  </span>
                  <span className="table-cell">{line}</span>
                </div>
              ))
            : content}
        </code>
      </pre>
    </div>
  );
}
