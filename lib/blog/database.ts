import { BlogPost } from "./types";
import { createClient } from "@/lib/supabase/server";

// These functions will be implemented once Supabase is set up
export async function getAllDatabasePosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select("*");

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return data.map((post) => ({
    ...post,
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.created_at,
    author: post.author,
    topic: post.topic,
    featured_image_url: post.featured_image_url,
    content: post.content,
  }));
}

export async function getDatabasePost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching post:", error);
    return null;
  }

  return {
    ...data,
    slug: data.slug,
    title: data.title,
    description: data.description,
    date: data.created_at,
    author: data.author,
    topic: data.topic,
    featured_image_url: data.featured_image_url,
    content: data.content,
  };
}
