'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { BilingualNode } from '@/lib/lexical/nodes/BilingualNode';
import { useEditingLanguage } from '@/lib/EditingLanguageContext';
import {
  Bold,
  Italic,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Plus,
  X,
} from 'lucide-react';

interface BilingualNodeComponentProps {
  nodeKey: string;
}

const LANG_LABELS: Record<string, string> = {
  en: 'EN',
  ga: 'GA',
  ja: 'JA',
};

const LANG_FULL: Record<string, string> = {
  en: 'English',
  ga: 'Gaeilge',
  ja: '日本語',
};

// Core languages always present, optional ones can be added/removed
const CORE_LANGUAGES = ['en', 'ga'];
const OPTIONAL_LANGUAGES = ['ja'];

// Wrap selected text with before/after tokens (toggle)
function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  onUpdate: (value: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.slice(start, end);

  const beforeMatch = text.slice(Math.max(0, start - before.length), start);
  const afterMatch = text.slice(end, end + after.length);
  if (beforeMatch === before && afterMatch === after) {
    const newValue =
      text.slice(0, start - before.length) + selected + text.slice(end + after.length);
    onUpdate(newValue);
    requestAnimationFrame(() => {
      textarea.selectionStart = start - before.length;
      textarea.selectionEnd = end - before.length;
      textarea.focus();
    });
    return;
  }

  const newValue = text.slice(0, start) + before + selected + after + text.slice(end);
  onUpdate(newValue);
  requestAnimationFrame(() => {
    textarea.selectionStart = start + before.length;
    textarea.selectionEnd = end + before.length;
    textarea.focus();
  });
}

// Insert a link around the selection
function insertLink(
  textarea: HTMLTextAreaElement,
  onUpdate: (value: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.slice(start, end);

  const linkText = selected || 'link text';
  const md = `[${linkText}](url)`;
  const newValue = text.slice(0, start) + md + text.slice(end);
  onUpdate(newValue);
  requestAnimationFrame(() => {
    // Select "url" so the user can type the URL immediately
    const urlStart = start + linkText.length + 2; // after "[text]("
    textarea.selectionStart = urlStart;
    textarea.selectionEnd = urlStart + 3; // select "url"
    textarea.focus();
  });
}

// Prefix each selected line with a marker (- or 1.)
function prefixLines(
  textarea: HTMLTextAreaElement,
  getPrefix: (i: number) => string,
  onUpdate: (value: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;

  // Expand selection to full lines
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = text.indexOf('\n', end);
  const blockEnd = lineEnd === -1 ? text.length : lineEnd;

  const block = text.slice(lineStart, blockEnd);
  const lines = block.split('\n');
  const prefixed = lines.map((line, i) => {
    const prefix = getPrefix(i);
    // Toggle: if line already starts with this prefix, remove it
    if (line.startsWith(prefix)) {
      return line.slice(prefix.length);
    }
    // Strip other list prefixes before adding new one
    const stripped = line.replace(/^(\d+\.\s|- )/, '');
    return prefix + stripped;
  });

  const newBlock = prefixed.join('\n');
  const newValue = text.slice(0, lineStart) + newBlock + text.slice(blockEnd);
  onUpdate(newValue);
  requestAnimationFrame(() => {
    textarea.selectionStart = lineStart;
    textarea.selectionEnd = lineStart + newBlock.length;
    textarea.focus();
  });
}

function insertAlignment(
  textarea: HTMLTextAreaElement,
  align: string,
  onUpdate: (value: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.slice(start, end) || 'text';

  if (align === 'left') {
    const newValue = text.slice(0, start) + selected + text.slice(end);
    onUpdate(newValue);
    requestAnimationFrame(() => {
      textarea.selectionStart = start;
      textarea.selectionEnd = start + selected.length;
      textarea.focus();
    });
    return;
  }

  const wrapper = `<div style="text-align: ${align}">${selected}</div>`;
  const newValue = text.slice(0, start) + wrapper + text.slice(end);
  onUpdate(newValue);
  requestAnimationFrame(() => {
    const innerStart = start + `<div style="text-align: ${align}">`.length;
    textarea.selectionStart = innerStart;
    textarea.selectionEnd = innerStart + selected.length;
    textarea.focus();
  });
}

export default function BilingualNodeComponent({ nodeKey }: BilingualNodeComponentProps) {
  const [editor] = useLexicalComposerContext();
  const { language: globalLang } = useEditingLanguage();
  const [activeTab, setActiveTab] = useState(globalLang);
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  useEffect(() => {
    setActiveTab(globalLang);
  }, [globalLang]);

  const [nodeData, setNodeData] = useState(() => {
    let data = { languages: ['en', 'ga'], content: { en: '', ga: '' } as Record<string, string> };
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey);
      if (node instanceof BilingualNode) {
        data = {
          languages: node.getLanguages(),
          content: node.getContent(),
        };
      }
    });
    return data;
  });

  const updateContent = useCallback(
    (lang: string, value: string) => {
      const newContent = { ...nodeData.content, [lang]: value };
      setNodeData((prev) => ({ ...prev, content: newContent }));
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node instanceof BilingualNode) {
          node.setContent(newContent);
        }
      });
    },
    [editor, nodeKey, nodeData.content]
  );

  const getActiveTextarea = () => textareaRefs.current[activeTab] ?? null;

  const handleBold = () => {
    const ta = getActiveTextarea();
    if (ta) wrapSelection(ta, '**', '**', (v) => updateContent(activeTab, v));
  };

  const handleItalic = () => {
    const ta = getActiveTextarea();
    if (ta) wrapSelection(ta, '*', '*', (v) => updateContent(activeTab, v));
  };

  const handleStrikethrough = () => {
    const ta = getActiveTextarea();
    if (ta) wrapSelection(ta, '~~', '~~', (v) => updateContent(activeTab, v));
  };

  const handleLink = () => {
    const ta = getActiveTextarea();
    if (ta) insertLink(ta, (v) => updateContent(activeTab, v));
  };

  const handleBulletList = () => {
    const ta = getActiveTextarea();
    if (ta) prefixLines(ta, () => '- ', (v) => updateContent(activeTab, v));
  };

  const handleNumberedList = () => {
    const ta = getActiveTextarea();
    if (ta) prefixLines(ta, (i) => `${i + 1}. `, (v) => updateContent(activeTab, v));
  };

  const handleAlign = (align: string) => {
    const ta = getActiveTextarea();
    if (ta) insertAlignment(ta, align, (v) => updateContent(activeTab, v));
  };

  const addableLanguages = OPTIONAL_LANGUAGES.filter(
    (l) => !nodeData.languages.includes(l)
  );

  const addLanguage = useCallback(
    (lang: string) => {
      const newLanguages = [...nodeData.languages, lang];
      const newContent = { ...nodeData.content, [lang]: '' };
      setNodeData({ languages: newLanguages, content: newContent });
      setActiveTab(lang);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node instanceof BilingualNode) {
          node.setLanguages(newLanguages);
          node.setContent(newContent);
        }
      });
    },
    [editor, nodeKey, nodeData]
  );

  const removeLanguage = useCallback(
    (lang: string) => {
      if (CORE_LANGUAGES.includes(lang)) return; // Can't remove core languages
      const newLanguages = nodeData.languages.filter((l) => l !== lang);
      const newContent = { ...nodeData.content };
      delete newContent[lang];
      setNodeData({ languages: newLanguages, content: newContent });
      if (activeTab === lang) setActiveTab(newLanguages[0]);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node instanceof BilingualNode) {
          node.setLanguages(newLanguages);
          node.setContent(newContent);
        }
      });
    },
    [editor, nodeKey, nodeData, activeTab]
  );

  const isRemovable = (lang: string) => !CORE_LANGUAGES.includes(lang);

  return (
    <div className="my-3 group/bilingual" data-lexical-decorator="true">
      <div className="flex rounded-lg overflow-hidden border border-purple-200/60 dark:border-purple-800/40 bg-white dark:bg-gray-900/50">
        {/* Left language rail */}
        <div className="flex flex-col w-9 flex-shrink-0 bg-purple-50/80 dark:bg-purple-950/30 border-r border-purple-200/60 dark:border-purple-800/40">
          {nodeData.languages.map((lang, i) => (
            <div key={lang} className={`relative flex-1 ${i === 0 ? '' : 'border-t border-purple-200/60 dark:border-purple-800/40'}`}>
              <button
                onClick={() => setActiveTab(lang)}
                title={LANG_FULL[lang] ?? lang}
                className={`
                  w-full h-full flex items-center justify-center text-[10px] font-bold tracking-wider
                  transition-all duration-150 select-none
                  ${activeTab === lang
                    ? 'bg-purple-600 text-white dark:bg-purple-500'
                    : 'text-purple-400 dark:text-purple-600 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100/60 dark:hover:bg-purple-900/30'
                  }
                `}
              >
                {LANG_LABELS[lang] ?? lang.toUpperCase().slice(0, 2)}
              </button>
              {isRemovable(lang) && (
                <button
                  onClick={() => removeLanguage(lang)}
                  title={`Remove ${LANG_FULL[lang] ?? lang}`}
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/bilingual:opacity-100 transition-opacity z-10"
                >
                  <X className="w-2 h-2" />
                </button>
              )}
            </div>
          ))}
          {addableLanguages.length > 0 && (
            <button
              onClick={() => addLanguage(addableLanguages[0])}
              title={`Add ${LANG_FULL[addableLanguages[0]] ?? addableLanguages[0]}`}
              className="flex items-center justify-center py-1.5 border-t border-purple-200/60 dark:border-purple-800/40 text-purple-400 dark:text-purple-600 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100/60 dark:hover:bg-purple-900/30 transition-all duration-150"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {/* Mini formatting toolbar */}
          <div className="flex items-center gap-0.5 px-2 py-1 border-b border-purple-100/60 dark:border-purple-800/30 bg-gray-50/50 dark:bg-gray-800/30">
            <MiniButton onClick={handleBold} title="Bold (**text**)">
              <Bold className="w-3 h-3" />
            </MiniButton>
            <MiniButton onClick={handleItalic} title="Italic (*text*)">
              <Italic className="w-3 h-3" />
            </MiniButton>
            <MiniButton onClick={handleStrikethrough} title="Strikethrough (~~text~~)">
              <Strikethrough className="w-3 h-3" />
            </MiniButton>
            <MiniButton onClick={handleLink} title="Link [text](url)">
              <LinkIcon className="w-3 h-3" />
            </MiniButton>
            <div className="w-px h-3.5 bg-gray-300 dark:bg-gray-600 mx-0.5" />
            <MiniButton onClick={handleBulletList} title="Bullet list">
              <List className="w-3 h-3" />
            </MiniButton>
            <MiniButton onClick={handleNumberedList} title="Numbered list">
              <ListOrdered className="w-3 h-3" />
            </MiniButton>
            <div className="w-px h-3.5 bg-gray-300 dark:bg-gray-600 mx-0.5" />
            <MiniButton onClick={() => handleAlign('left')} title="Align left">
              <AlignLeft className="w-3 h-3" />
            </MiniButton>
            <MiniButton onClick={() => handleAlign('center')} title="Align center">
              <AlignCenter className="w-3 h-3" />
            </MiniButton>
            <MiniButton onClick={() => handleAlign('right')} title="Align right">
              <AlignRight className="w-3 h-3" />
            </MiniButton>
            <MiniButton onClick={() => handleAlign('justify')} title="Justify">
              <AlignJustify className="w-3 h-3" />
            </MiniButton>
            <span className="ml-auto text-[10px] text-purple-400/60 dark:text-purple-500/40 select-none">
              Markdown
            </span>
          </div>

          {nodeData.languages.map((lang) => (
            <div key={lang} className={activeTab === lang ? '' : 'hidden'}>
              <textarea
                ref={(el) => { textareaRefs.current[lang] = el; }}
                value={nodeData.content[lang] ?? ''}
                onChange={(e) => updateContent(lang, e.target.value)}
                onKeyDown={(e) => {
                  // Stop Lexical from intercepting keyboard events inside the textarea
                  // so undo/redo, select-all, copy/paste, etc. work natively
                  e.stopPropagation();

                  if (e.metaKey || e.ctrlKey) {
                    if (e.key === 'b') {
                      e.preventDefault();
                      handleBold();
                    } else if (e.key === 'i') {
                      e.preventDefault();
                      handleItalic();
                    } else if (e.key === 'k') {
                      e.preventDefault();
                      handleLink();
                    }
                  }
                }}
                placeholder={`Write in ${LANG_FULL[lang] ?? lang}...`}
                className="w-full min-h-[120px] p-3 bg-transparent text-gray-900 dark:text-white resize-y focus:outline-none text-sm leading-relaxed font-mono placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniButton({
  onClick,
  children,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1 rounded text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors"
    >
      {children}
    </button>
  );
}
