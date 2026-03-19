-- Add translation linking between posts
-- A translation post points to the original via translation_of
ALTER TABLE posts ADD COLUMN translation_of UUID REFERENCES posts(id) ON DELETE SET NULL;
CREATE INDEX idx_posts_translation_of ON posts(translation_of);
