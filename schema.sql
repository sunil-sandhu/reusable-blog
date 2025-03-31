CREATE TABLE posts (
    id uuid PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    slug VARCHAR(255) NOT NULL,
    website_id uuid NOT NULL REFERENCES websites(id)
);

CREATE TABLE websites (
    id uuid PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);