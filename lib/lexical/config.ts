import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { CodeNode } from '@lexical/code';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { ImageNode } from './nodes/ImageNode';
import { CodeBlockNode } from './nodes/CodeBlockNode';
import { VideoNode } from './nodes/VideoNode';
import { EmbedNode } from './nodes/EmbedNode';
import { TableBlockNode } from './nodes/TableBlockNode';
import { InteractiveNode } from './nodes/InteractiveNode';
import { BilingualNode } from './nodes/BilingualNode';
import { CalloutNode } from './nodes/CalloutNode';
import { ToggleContainerNode } from './nodes/ToggleContainerNode';
import { ToggleTitleNode } from './nodes/ToggleTitleNode';
import { ToggleContentNode } from './nodes/ToggleContentNode';
import { FootnoteRefNode } from './nodes/FootnoteRefNode';
import { SuggestionMarkNode } from './nodes/SuggestionMarkNode';
import { SuggestionBlockNode } from './nodes/SuggestionBlockNode';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';

export const EDITOR_NODES = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  CodeNode,
  HorizontalRuleNode,
  ImageNode,
  CodeBlockNode,
  VideoNode,
  EmbedNode,
  TableBlockNode,
  InteractiveNode,
  BilingualNode,
  CalloutNode,
  ToggleContainerNode,
  ToggleTitleNode,
  ToggleContentNode,
  FootnoteRefNode,
  SuggestionMarkNode,
  SuggestionBlockNode,
];

export const EDITOR_THEME: InitialConfigType['theme'] = {
  paragraph: 'mb-2',
  heading: {
    h1: 'text-3xl font-bold mt-8 mb-4',
    h2: 'text-2xl font-bold mt-6 mb-3',
    h3: 'text-xl font-bold mt-5 mb-2',
    h4: 'text-lg font-bold mt-4 mb-2',
    h5: 'text-base font-bold mt-3 mb-1',
    h6: 'text-sm font-bold mt-3 mb-1',
  },
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal pl-6 mb-4',
    ul: 'list-disc pl-6 mb-4',
    listitem: 'mb-1',
    listitemChecked: 'line-through text-gray-400',
    listitemUnchecked: '',
  },
  quote: 'border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4 text-gray-600 dark:text-gray-400',
  link: 'text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    strikethrough: 'line-through',
    underline: 'underline',
    code: 'bg-gray-100 dark:bg-gray-800 text-red-500 dark:text-red-400 px-1 py-0.5 rounded text-sm font-mono',
    underlineStrikethrough: 'underline line-through',
  },
  code: 'bg-gray-100 dark:bg-gray-800 text-red-500 dark:text-red-400 px-1 py-0.5 rounded text-sm font-mono',
  horizontalrule: 'border-t border-gray-300 dark:border-gray-600 my-6',
};
