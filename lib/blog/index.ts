import { BlogPost, DataSource } from "./types";
import { getAllLocalPosts, getLocalPost } from "./local";
import { getAllSupabasePosts, getSupabasePost } from "./supabase";

export async function getAllPosts(
  source: DataSource = "all"
): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];

  if (source === "all" || source === "local") {
    const localPosts = await getAllLocalPosts();
    posts.push(...localPosts);
  }

  if (source === "all" || source === "supabase") {
    const supabasePosts = await getAllSupabasePosts();
    posts.push(...supabasePosts);
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPost(
  slug: string,
  source: DataSource = "all"
): Promise<BlogPost | null> {
  if (source === "all" || source === "local") {
    const localPost = await getLocalPost(slug);
    if (localPost) return localPost;
  }

  if (source === "all" || source === "supabase") {
    const supabasePost = await getSupabasePost(slug);
    if (supabasePost) return supabasePost;
  }

  return null;
}
