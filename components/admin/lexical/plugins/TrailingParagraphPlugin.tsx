'use client';

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $createParagraphNode,
  $isParagraphNode,
  COMMAND_PRIORITY_LOW,
} from 'lexical';

/**
 * Ensures there is always an empty paragraph at the end of the document.
 * This lets users click below the last block to continue typing.
 */
export default function TrailingParagraphPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const lastChild = root.getLastChild();

        // If the document is empty or the last node is not an empty paragraph, add one
        const needsTrailing =
          !lastChild ||
          !$isParagraphNode(lastChild) ||
          lastChild.getTextContentSize() > 0 ||
          lastChild.getChildrenSize() > 1;

        if (needsTrailing) {
          editor.update(
            () => {
              const root = $getRoot();
              const last = root.getLastChild();

              // Re-check inside the update to avoid race conditions
              if (
                !last ||
                !$isParagraphNode(last) ||
                last.getTextContentSize() > 0 ||
                last.getChildrenSize() > 1
              ) {
                root.append($createParagraphNode());
              }
            },
            { discrete: true }
          );
        }
      });
    });
  }, [editor]);

  return null;
}
