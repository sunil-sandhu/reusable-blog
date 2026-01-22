import { BlogPost } from "./types";

// Local posts are no longer used - all posts come from the database
export async function getAllLocalPosts(): Promise<BlogPost[]> {
  return [];
}

export async function getLocalPost(slug: string): Promise<BlogPost | null> {
  return null;
}
