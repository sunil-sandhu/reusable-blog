import { BlogPost } from "./types";
import { createClient } from "@/lib/supabase/client";

// These functions will be implemented once Supabase is set up
export async function getAllDatabasePosts(): Promise<BlogPost[]> {
  if (!process.env.WEBSITE_ID) {
    console.warn("WEBSITE_ID is not set, querying all posts");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }

    return data;
  } else {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .eq("website_id", process.env.WEBSITE_ID);

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
}

export async function getLatestDatabasePosts(): Promise<BlogPost[]> {
  if (!process.env.WEBSITE_ID) {
    console.warn("WEBSITE_ID is not set, querying all posts");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }

    return data;
  } else {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("website_id", process.env.WEBSITE_ID)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }

    return data.map((post) => ({
      ...post,
      slug: post.slug,
      title: post.title,
      description: post.description,
    }));
  }
}

export async function getDatabasePost(slug: string): Promise<BlogPost | null> {
  const supabase = createClient();
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
