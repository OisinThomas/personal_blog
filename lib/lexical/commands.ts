import { createCommand, LexicalCommand } from 'lexical';

export type InsertImagePayload = {
  assetId?: string;
  src?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
};

export type InsertCodeBlockPayload = {
  code?: string;
  language?: string;
  filename?: string;
};

export type InsertVideoPayload = {
  provider?: string;
  videoId?: string;
  caption?: string;
};

export type InsertEmbedPayload = {
  url?: string;
  html?: string;
  provider?: string;
};

export type InsertTableBlockPayload = {
  headers?: string[];
  rows?: string[][];
  alignments?: string[];
};

export type InsertInteractivePayload = {
  componentSlug?: string;
  props?: Record<string, unknown>;
};

export type InsertBilingualPayload = {
  languages?: string[];
  content?: Record<string, string>;
};

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand('INSERT_IMAGE_COMMAND');
export const INSERT_CODE_BLOCK_COMMAND: LexicalCommand<InsertCodeBlockPayload> =
  createCommand('INSERT_CODE_BLOCK_COMMAND');
export const INSERT_VIDEO_COMMAND: LexicalCommand<InsertVideoPayload> =
  createCommand('INSERT_VIDEO_COMMAND');
export const INSERT_EMBED_COMMAND: LexicalCommand<InsertEmbedPayload> =
  createCommand('INSERT_EMBED_COMMAND');
export const INSERT_TABLE_BLOCK_COMMAND: LexicalCommand<InsertTableBlockPayload> =
  createCommand('INSERT_TABLE_BLOCK_COMMAND');
export const INSERT_INTERACTIVE_COMMAND: LexicalCommand<InsertInteractivePayload> =
  createCommand('INSERT_INTERACTIVE_COMMAND');
export const INSERT_BILINGUAL_COMMAND: LexicalCommand<InsertBilingualPayload> =
  createCommand('INSERT_BILINGUAL_COMMAND');
export const INSERT_CALLOUT_COMMAND: LexicalCommand<string> =
  createCommand('INSERT_CALLOUT_COMMAND');
export const INSERT_TOGGLE_COMMAND: LexicalCommand<void> =
  createCommand('INSERT_TOGGLE_COMMAND');

export type InsertFootnoteRefPayload = {
  footnoteId: string;
  label: string;
};

export const INSERT_FOOTNOTE_REF_COMMAND: LexicalCommand<InsertFootnoteRefPayload> =
  createCommand('INSERT_FOOTNOTE_REF_COMMAND');
