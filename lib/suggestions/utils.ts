import type { EditorState } from 'lexical';
import { $isSuggestionMarkNode } from '@/lib/lexical/nodes/SuggestionMarkNode';
import { $isSuggestionBlockNode } from '@/lib/lexical/nodes/SuggestionBlockNode';

export interface SuggestionCount {
  inline: number;
  block: number;
  total: number;
}

/**
 * Count pending suggestions by scanning the editor state.
 * Must be called within editor.getEditorState().read() or a read callback.
 */
export function countSuggestions(editorState: EditorState): SuggestionCount {
  let inline = 0;
  let block = 0;

  editorState.read(() => {
    const nodeMap = editorState._nodeMap;
    for (const [, node] of nodeMap) {
      if ($isSuggestionMarkNode(node)) {
        inline++;
      } else if ($isSuggestionBlockNode(node)) {
        block++;
      }
    }
  });

  return { inline, block, total: inline + block };
}
