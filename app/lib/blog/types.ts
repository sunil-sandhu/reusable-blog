export interface BlogPost {
  author?: string;
  content: string;
  date: string;
  description: string;
  featured_image_url?: string;
  slug: string;
  title: string;
  topic?: string;
  isMDX?: boolean;
}

export type DataSource = "local" | "supabase" | "all";
