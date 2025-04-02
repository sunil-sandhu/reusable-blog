import { parseFrontmatter } from "../parse-frontmatter";
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

  // get the frontmatter from the content
  const posts = await Promise.all(
    data.map(async (post) => {
      const { data: frontmatter, content } = parseFrontmatter(post.content);
      return {
        ...post,
        slug: post.slug,
        title: frontmatter.title || "",
        description: frontmatter.description || "",
        date: frontmatter.date || new Date().toISOString(),
        author: frontmatter.author || "",
        topic: frontmatter.topic || "",
        featured_image_url: frontmatter.featured_image_url || "",
        content,
      };
    })
  );
  return posts;
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

  const { data: frontmatter, content } = parseFrontmatter(data.content);

  return {
    ...data,
    slug: data.slug,
    title: frontmatter.title || "",
    description: frontmatter.description || "",
    date: frontmatter.date || new Date().toISOString(),
    author: frontmatter.author || "",
    topic: frontmatter.topic || "",
    featured_image_url: frontmatter.featured_image_url || "",
    content,
  };
}
