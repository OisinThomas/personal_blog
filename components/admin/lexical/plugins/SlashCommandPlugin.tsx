'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  TextNode,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $createQuoteNode } from '@lexical/rich-text';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { $createHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { $createCodeBlockNode } from '@/lib/lexical/nodes/CodeBlockNode';
import { $createImageNode } from '@/lib/lexical/nodes/ImageNode';
import { $createVideoNode } from '@/lib/lexical/nodes/VideoNode';
import { $createEmbedNode } from '@/lib/lexical/nodes/EmbedNode';
import { $createTableBlockNode } from '@/lib/lexical/nodes/TableBlockNode';
import { $createBilingualNode } from '@/lib/lexical/nodes/BilingualNode';
import { $createCalloutNode } from '@/lib/lexical/nodes/CalloutNode';
import { $createToggleContainerNode } from '@/lib/lexical/nodes/ToggleContainerNode';
import { $createToggleTitleNode } from '@/lib/lexical/nodes/ToggleTitleNode';
import { $createToggleContentNode } from '@/lib/lexical/nodes/ToggleContentNode';
import { INSERT_FOOTNOTE_REF_COMMAND } from '@/lib/lexical/commands';
import SlashCommandMenu, { getSlashCommandItems } from '../SlashCommandMenu';

interface SlashCommandPluginProps {
  onInsertFootnote?: () => { id: string; label: string } | null;
}

export default function SlashCommandPlugin({ onInsertFootnote }: SlashCommandPluginProps = {}) {
  const [editor] = useLexicalComposerContext();
  const [showMenu, setShowMenu] = useState(false);
  const [filter, setFilter] = useState('');
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const closeMenu = useCallback(() => {
    setShowMenu(false);
    setFilter('');
  }, []);

  // Delete the slash text and execute action
  const executeCommand = useCallback(
    (action: () => void) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();

        if (anchorNode instanceof TextNode) {
          const text = anchorNode.getTextContent();
          // Find and remove the "/" and any filter text
          const slashIdx = text.lastIndexOf('/');
          if (slashIdx !== -1) {
            // Remove the slash command text
            const before = text.slice(0, slashIdx);
            if (before) {
              anchorNode.setTextContent(before);
            } else {
              anchorNode.remove();
            }
          }
        }

        action();
      });
      closeMenu();
    },
    [editor, closeMenu]
  );

  const items = getSlashCommandItems({
    onHeading: (level: 1 | 2 | 3) =>
      executeCommand(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(`h${level}` as HeadingTagType));
        }
      }),
    onBulletList: () =>
      executeCommand(() => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      }),
    onNumberedList: () =>
      executeCommand(() => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      }),
    onQuote: () =>
      executeCommand(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      }),
    onCallout: () =>
      executeCommand(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const callout = $createCalloutNode('note');
          const paragraph = $createParagraphNode();
          callout.append(paragraph);
          selection.insertNodes([callout]);
        }
      }),
    onToggle: () =>
      executeCommand(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const container = $createToggleContainerNode(true);
          const title = $createToggleTitleNode();
          const content = $createToggleContentNode();
          const titleParagraph = $createParagraphNode();
          const contentParagraph = $createParagraphNode();
          title.append(titleParagraph);
          content.append(contentParagraph);
          container.append(title, content);
          selection.insertNodes([container]);
        }
      }),
    onCodeBlock: () =>
      executeCommand(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const codeBlock = $createCodeBlockNode();
          selection.insertNodes([codeBlock]);
        }
      }),
    onDivider: () =>
      executeCommand(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const hr = $createHorizontalRuleNode();
          selection.insertNodes([hr]);
        }
      }),
    onTable: () =>
      executeCommand(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const table = $createTableBlockNode();
          selection.insertNodes([table]);
        }
      }),
    onImage: () =>
      executeCommand(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const image = $createImageNode({});
          selection.insertNodes([image]);
        }
      }),
    onVideo: () =>
      executeCommand(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const video = $createVideoNode();
          selection.insertNodes([video]);
        }
      }),
    onEmbed: () =>
      executeCommand(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const embed = $createEmbedNode();
          selection.insertNodes([embed]);
        }
      }),
    onBilingual: () =>
      executeCommand(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const bilingual = $createBilingualNode();
          selection.insertNodes([bilingual]);
        }
      }),
    onFootnote: () => {
      if (!onInsertFootnote) return;
      const footnote = onInsertFootnote();
      if (!footnote) return;
      executeCommand(() => {
        editor.dispatchCommand(INSERT_FOOTNOTE_REF_COMMAND, {
          footnoteId: footnote.id,
          label: footnote.label,
        });
      });
    },
  });

  // Listen for text changes to detect "/" trigger
  useEffect(() => {
    const removeListener = editor.registerTextContentListener((textContent) => {
      // We need to check in an editor.getEditorState().read() context
    });

    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          if (showMenu) closeMenu();
          return;
        }

        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();

        if (!(anchorNode instanceof TextNode)) {
          if (showMenu) closeMenu();
          return;
        }

        const text = anchorNode.getTextContent();
        const offset = anchor.offset;
        const textBeforeCursor = text.slice(0, offset);

        // Check for "/" at the start of the paragraph or preceded by whitespace
        const slashMatch = textBeforeCursor.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);

        if (slashMatch) {
          const filterText = slashMatch[1];
          setFilter(filterText);

          // Get cursor position for menu placement
          const domSelection = window.getSelection();
          if (domSelection && domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setAnchorRect(rect);
          }

          setShowMenu(true);
        } else {
          if (showMenu) closeMenu();
        }
      });
    });

    return () => {
      removeListener();
      removeUpdateListener();
    };
  }, [editor, showMenu, closeMenu]);

  // Suppress default editor key handling when menu is open
  useEffect(() => {
    if (!showMenu) return;

    const cmds = [
      editor.registerCommand(KEY_ARROW_DOWN_COMMAND, () => true, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ARROW_UP_COMMAND, () => true, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ENTER_COMMAND, () => true, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, () => {
        closeMenu();
        return true;
      }, COMMAND_PRIORITY_LOW),
    ];

    return () => cmds.forEach((remove) => remove());
  }, [editor, showMenu, closeMenu]);

  if (!showMenu) return null;

  return (
    <SlashCommandMenu
      items={items}
      anchorRect={anchorRect}
      onClose={closeMenu}
      filter={filter}
    />
  );
}
