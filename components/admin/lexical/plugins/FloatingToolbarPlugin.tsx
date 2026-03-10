'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  $isElementNode,
  type ElementFormatType,
} from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { mergeRegister } from '@lexical/utils';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Check,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';

export default function FloatingToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [elementFormat, setElementFormat] = useState<ElementFormatType>('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection) || selection.isCollapsed()) {
      setIsVisible(false);
      return;
    }

    // Check text format states
    setIsBold(selection.hasFormat('bold'));
    setIsItalic(selection.hasFormat('italic'));
    setIsStrikethrough(selection.hasFormat('strikethrough'));
    setIsCode(selection.hasFormat('code'));

    // Check for link
    const nodes = selection.getNodes();
    const isEveryLink = nodes.every((node) => {
      const parent = node.getParent();
      return $isLinkNode(parent) || $isLinkNode(node);
    });
    setIsLink(isEveryLink);

    // Check element format (alignment)
    const anchorNode = selection.anchor.getNode();
    const element = $isElementNode(anchorNode)
      ? anchorNode
      : anchorNode.getParent();
    if (element && $isElementNode(element)) {
      setElementFormat(element.getFormatType());
    }

    // Position the toolbar
    const nativeSelection = window.getSelection();
    if (nativeSelection && nativeSelection.rangeCount > 0) {
      const range = nativeSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPosition({
        top: rect.top - 48,
        left: rect.left + rect.width / 2,
      });
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkInput]);

  const handleLinkSubmit = () => {
    if (linkUrl.trim()) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const toggleLink = () => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = selection.getNodes()[0];
          const parent = node.getParent();
          if ($isLinkNode(parent)) {
            setLinkUrl(parent.getURL());
          }
        }
      });
      setShowLinkInput(true);
    }
  };

  if (!isVisible) return null;

  return createPortal(
    <div
      ref={toolbarRef}
      className="fixed z-50 flex items-center gap-0.5 bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg p-1 -translate-x-1/2"
      style={{ top: position.top, left: position.left }}
    >
      {showLinkInput ? (
        <div className="flex items-center gap-1 px-1">
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLinkSubmit();
              if (e.key === 'Escape') setShowLinkInput(false);
            }}
            placeholder="https://..."
            className="w-48 px-2 py-1 text-xs bg-gray-800 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleLinkSubmit}
            className="p-1 text-green-400 hover:text-green-300"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowLinkInput(false)}
            className="p-1 text-gray-400 hover:text-gray-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          <ToolbarButton
            active={isBold}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={isItalic}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={isStrikethrough}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={isCode}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
            title="Inline code"
          >
            <Code className="w-3.5 h-3.5" />
          </ToolbarButton>
          <div className="w-px h-5 bg-gray-600 mx-0.5" />
          <ToolbarButton active={isLink} onClick={toggleLink} title="Link">
            <LinkIcon className="w-3.5 h-3.5" />
          </ToolbarButton>
          <div className="w-px h-5 bg-gray-600 mx-0.5" />
          <ToolbarButton
            active={elementFormat === '' || elementFormat === 'left'}
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
            title="Align left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={elementFormat === 'center'}
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
            title="Align center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={elementFormat === 'right'}
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
            title="Align right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={elementFormat === 'justify'}
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
            title="Justify"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </ToolbarButton>
        </>
      )}
    </div>,
    document.body
  );
}

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'text-blue-400 bg-blue-900/40'
          : 'text-gray-300 hover:text-white hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}
