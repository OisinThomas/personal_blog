-- =============================================================================
-- Newsletter subscription system
-- =============================================================================

-- Channels (subscription lists)
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed channels
INSERT INTO channels (slug, name, description, position) VALUES
  ('all', 'All Posts', 'Every post, regardless of language', 0),
  ('en', 'English', 'English language posts only', 1),
  ('ga', 'Gaeilge', 'Irish language posts only', 2);

-- Subscribers
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  confirmation_token UUID DEFAULT gen_random_uuid(),
  unsubscribe_token UUID DEFAULT gen_random_uuid(),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriber ↔ Channel join
CREATE TABLE subscriber_channels (
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  PRIMARY KEY (subscriber_id, channel_id)
);

-- Post ↔ Channel join (which channels a post targets)
CREATE TABLE post_channels (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, channel_id)
);

-- Email send batches
CREATE TABLE email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  subscriber_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email open tracking
CREATE TABLE email_opens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_send_id UUID NOT NULL REFERENCES email_sends(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT,
  UNIQUE (email_send_id, subscriber_id)
);

-- Indexes
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_confirmation_token ON subscribers(confirmation_token) WHERE confirmation_token IS NOT NULL;
CREATE INDEX idx_subscribers_unsubscribe_token ON subscribers(unsubscribe_token) WHERE unsubscribe_token IS NOT NULL;
CREATE INDEX idx_email_sends_post_id ON email_sends(post_id);
CREATE INDEX idx_email_opens_send_id ON email_opens(email_send_id);

-- =============================================================================
-- RLS policies — admin only (authenticated users)
-- =============================================================================

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_opens ENABLE ROW LEVEL SECURITY;

-- Channels: public read (for subscribe form), authenticated write
CREATE POLICY "Public can read channels"
  ON channels FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can manage channels"
  ON channels FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Subscribers: authenticated only
CREATE POLICY "Authenticated can manage subscribers"
  ON subscribers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Subscriber channels: authenticated only
CREATE POLICY "Authenticated can manage subscriber_channels"
  ON subscriber_channels FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Post channels: authenticated only
CREATE POLICY "Authenticated can manage post_channels"
  ON post_channels FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Email sends: authenticated only
CREATE POLICY "Authenticated can manage email_sends"
  ON email_sends FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Email opens: authenticated only
CREATE POLICY "Authenticated can manage email_opens"
  ON email_opens FOR ALL TO authenticated USING (true) WITH CHECK (true);
