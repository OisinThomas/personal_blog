import {
  TRANSFORMERS,
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from '@lexical/markdown';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import type { ElementTransformer } from '@lexical/markdown';

const HORIZONTAL_RULE: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node) => {
    if (node.getType() === 'horizontalrule') {
      return '---';
    }
    return null;
  },
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _children, _match, isImport) => {
    const { $createHorizontalRuleNode } = require('@lexical/react/LexicalHorizontalRuleNode');
    const node = $createHorizontalRuleNode();
    if (isImport || parentNode.getChildren().length === 0) {
      parentNode.replace(node);
    } else {
      parentNode.insertBefore(node);
    }
  },
  type: 'element',
};

export const EXTENDED_TRANSFORMERS = [
  HORIZONTAL_RULE,
  ...ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
  CHECK_LIST,
];

// Re-export for convenience
export { TRANSFORMERS };
