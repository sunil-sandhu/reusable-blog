-- Create a PostgreSQL function for atomic view increment
-- This is more efficient than fetching and updating separately
CREATE OR REPLACE FUNCTION increment_post_views(post_slug TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_views INTEGER;
BEGIN
  UPDATE posts
  SET views = COALESCE(views, 0) + 1
  WHERE slug = post_slug
  RETURNING views INTO new_views;
  
  IF new_views IS NULL THEN
    RAISE EXCEPTION 'Post with slug % not found', post_slug;
  END IF;
  
  RETURN new_views;
END;
$$ LANGUAGE plpgsql;
