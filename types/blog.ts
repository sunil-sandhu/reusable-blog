export interface BlogPost {
  title: string;
  description?: string;
  date?: string;
  author?: string;
  topic?: string[];
  content: string;
  slug: string;
  website_id: string;
  featured_image_url?: string;
}
