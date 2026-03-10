-- Add Lexical editor state column for the new Notion-style editor
-- When editor_state is NULL, the post uses the legacy nodes-table rendering
ALTER TABLE posts ADD COLUMN IF NOT EXISTS editor_state JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS footnotes JSONB NOT NULL DEFAULT '[]';
