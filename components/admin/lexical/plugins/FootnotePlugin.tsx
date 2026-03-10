'use client';

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW } from 'lexical';
import { $createFootnoteRefNode } from '@/lib/lexical/nodes/FootnoteRefNode';
import { INSERT_FOOTNOTE_REF_COMMAND } from '@/lib/lexical/commands';

export default function FootnotePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_FOOTNOTE_REF_COMMAND,
      (payload) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = $createFootnoteRefNode(payload.footnoteId, payload.label);
          selection.insertNodes([node]);
        }
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}
