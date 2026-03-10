'use client';

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { INSERT_IMAGE_COMMAND, InsertImagePayload } from '@/lib/lexical/commands';
import { $createImageNode } from '@/lib/lexical/nodes/ImageNode';

export default function ImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload: InsertImagePayload) => {
        const imageNode = $createImageNode({
          assetId: payload.assetId,
          src: payload.src,
          alt: payload.alt,
          caption: payload.caption,
          width: payload.width,
          height: payload.height,
        });

        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertNodes([imageNode]);
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
