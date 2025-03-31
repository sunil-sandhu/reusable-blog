import { BlogPost, DataSource } from "./types";
import { getAllLocalPosts, getLocalPost } from "./local";
import { getAllSupabasePosts, getSupabasePost } from "./supabase";
import { slugify } from "../utils";

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

export async function getTopics(): Promise<string[]> {
  const posts = await getAllPosts();
  // remove duplicates
  const uniqueTopics = [
    ...new Set(posts.map((post) => slugify(post.topic || ""))),
  ];
  // return sorted alphabetically
  return uniqueTopics.sort();
}

export async function getPostsByTopic(slug: string): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => slugify(post.topic || "") === slug);
}

export async function getAuthors(): Promise<string[]> {
  const posts = await getAllPosts();
  return [
    ...new Set(
      posts.map((post) => post.author).filter((author) => author !== undefined)
    ),
  ];
}

export async function getPostsByAuthor(slug: string): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => slugify(post.author || "") === slug);
}
