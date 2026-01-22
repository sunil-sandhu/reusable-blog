import { BlogPost, DataSource } from "./types";
import { getAllLocalPosts, getLocalPost } from "./local";
import { getAllDatabasePosts, getDatabasePost } from "./database";
import { slugify } from "../utils";

export async function getAllPosts(
  source: DataSource = "database"
): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];

  if (source === "all" || source === "local") {
    const localPosts = await getAllLocalPosts();
    posts.push(...localPosts);
  }

  if (source === "all" || source === "database") {
    const supabasePosts = await getAllDatabasePosts();
    posts.push(...supabasePosts);
  }

  return posts.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    // Sort in reverse chronological order (most recent first)
    return dateB - dateA;
  });
}

export async function getPost(
  slug: string,
  source: DataSource = "database"
): Promise<BlogPost | null> {
  if (source === "all" || source === "local") {
    const localPost = await getLocalPost(slug);
    if (localPost) return localPost;
  }

  if (source === "all" || source === "database") {
    const supabasePost = await getDatabasePost(slug);
    if (supabasePost) return supabasePost;
  }

  return null;
}

export async function getTopics(): Promise<string[]> {
  const posts = await getAllPosts("database");
  // remove duplicates and empty strings
  const uniqueTopics = [
    ...new Set(
      posts
        .map((post) => post.topic?.toLowerCase() || "")
        .filter((topic): topic is string => topic !== "")
    ),
  ];
  // return sorted alphabetically
  return uniqueTopics.sort();
}

export async function getPostsByTopic(slug: string): Promise<BlogPost[]> {
  const posts = await getAllPosts("database");
  return posts.filter((post) => slugify(post.topic || "") === slug);
}

export async function getAuthors(): Promise<string[]> {
  const posts = await getAllPosts("database");
  // remove duplicates and empty strings
  const uniqueAuthors = [
    ...new Set(
      posts
        .map((post) => post.author || "")
        .filter((author): author is string => author !== "")
    ),
  ];
  // return sorted alphabetically
  return uniqueAuthors.sort();
}

export async function getPostsByAuthor(slug: string): Promise<BlogPost[]> {
  const posts = await getAllPosts("database");
  return posts.filter((post) => slugify(post.author || "") === slug);
}
