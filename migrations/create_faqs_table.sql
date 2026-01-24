-- Create post_faqs table
CREATE TABLE post_faqs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    faq_content JSONB NOT NULL,
    visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id)
);

-- Create index on post_id for faster lookups
CREATE INDEX idx_post_faqs_post_id ON post_faqs(post_id);

-- Create index on visible for filtering
CREATE INDEX idx_post_faqs_visible ON post_faqs(visible);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_post_faqs_updated_at BEFORE UPDATE ON post_faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
