export interface BlockActionPrompt {
  label: string;
  action: string;
  icon: string;
}

export const blockActionPrompts: BlockActionPrompt[] = [
  { label: 'Rewrite', action: 'rewrite', icon: 'pencil' },
  { label: 'Expand', action: 'expand', icon: 'expand' },
  { label: 'Simplify', action: 'simplify', icon: 'minimize' },
  { label: 'Fix Grammar', action: 'fix_grammar', icon: 'check' },
  { label: 'Make Concise', action: 'concise', icon: 'shrink' },
  { label: 'Formalize', action: 'formalize', icon: 'briefcase' },
  { label: 'Casualize', action: 'casualize', icon: 'smile' },
  { label: 'Translate to Irish', action: 'translate_ga', icon: 'languages' },
  { label: 'Translate to English', action: 'translate_en', icon: 'languages' },
];
