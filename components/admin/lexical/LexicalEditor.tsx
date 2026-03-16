'use client';

import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { EDITOR_NODES, EDITOR_THEME } from '@/lib/lexical/config';
import { EXTENDED_TRANSFORMERS } from '@/lib/lexical/transformers';
import SlashCommandPlugin from './plugins/SlashCommandPlugin';
import FloatingToolbarPlugin from './plugins/FloatingToolbarPlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import ImagePlugin from './plugins/ImagePlugin';
import AutoSavePlugin from './plugins/AutoSavePlugin';
import FootnotePlugin from './plugins/FootnotePlugin';
import TrailingParagraphPlugin from './plugins/TrailingParagraphPlugin';
import AIBlockMenu from '@/components/admin/ai/AIBlockMenu';
import { useEffect } from 'react';
import type { LexicalEditor as LexicalEditorType } from 'lexical';

interface LexicalEditorProps {
  postId: string;
  initialEditorState: Record<string, unknown> | null;
  onSave: (editorState: Record<string, unknown>) => Promise<void>;
  editorRef?: React.MutableRefObject<LexicalEditorType | null>;
  onInsertFootnote?: () => { id: string; label: string } | null;
  postLanguage?: string;
  onAIBlockAction?: (action: string, nodeKey: string, nodeText: string) => Promise<void>;
  onOpenAIChat?: (prompt: string) => void;
}

function EditorRefPlugin({ editorRef }: { editorRef?: React.MutableRefObject<LexicalEditorType | null> }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);
  return null;
}

export default function LexicalEditor({
  postId,
  initialEditorState,
  onSave,
  editorRef,
  onInsertFootnote,
  postLanguage = 'en',
  onAIBlockAction,
  onOpenAIChat,
}: LexicalEditorProps) {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [anchorElem, setAnchorElem] = useState<HTMLElement | null>(null);
  const [aiMenuState, setAiMenuState] = useState<{
    nodeKey: string;
    nodeText: string;
    position: { x: number; y: number };
  } | null>(null);

  const onRef = useCallback((elem: HTMLDivElement | null) => {
    if (elem !== null) {
      setAnchorElem(elem);
    }
  }, []);

  const handleAIButtonClick = useCallback(
    (info: { nodeKey: string; nodeText: string; position: { x: number; y: number } }) => {
      setAiMenuState(info);
    },
    []
  );

  const initialConfig = {
    namespace: 'BlogEditor',
    theme: EDITOR_THEME,
    nodes: EDITOR_NODES,
    editorState: initialEditorState
      ? JSON.stringify(initialEditorState)
      : undefined,
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative">
        <div ref={onRef}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[60vh] outline-none prose dark:prose-invert max-w-none focus:outline-none" />
            }
            placeholder={
              <div className="absolute top-0 left-0 pointer-events-none text-gray-400 dark:text-gray-500">
                Start writing, or type &apos;/&apos; for commands...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <MarkdownShortcutPlugin transformers={EXTENDED_TRANSFORMERS} />
        <ListPlugin />
        <LinkPlugin />
        <TabIndentationPlugin />
        <HorizontalRulePlugin />
        <SlashCommandPlugin onInsertFootnote={onInsertFootnote} />
        <FloatingToolbarPlugin />
        <DraggableBlockPlugin
          anchorElem={anchorElem}
          onAIButtonClick={onAIBlockAction && onOpenAIChat ? handleAIButtonClick : undefined}
        />
        <ImagePlugin />
        <FootnotePlugin />
        <TrailingParagraphPlugin />
        <AutoSavePlugin onSave={onSave} />
        <EditorRefPlugin editorRef={editorRef} />
        {aiMenuState && onAIBlockAction && onOpenAIChat &&
          createPortal(
            <AIBlockMenu
              position={aiMenuState.position}
              nodeKey={aiMenuState.nodeKey}
              nodeText={aiMenuState.nodeText}
              postLanguage={postLanguage}
              onAction={onAIBlockAction}
              onOpenInChat={onOpenAIChat}
              onClose={() => setAiMenuState(null)}
            />,
            document.body
          )
        }
      </div>
    </LexicalComposer>
  );
}
