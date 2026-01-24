-- Add views column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Create index on slug for faster lookups (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- Create index on views for sorting popular posts
CREATE INDEX IF NOT EXISTS idx_posts_views ON posts(views DESC);
