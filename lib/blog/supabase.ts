import { BlogPost } from "./types";
import { createClient } from "@/lib/supabase/server";

// These functions will be implemented once Supabase is set up
export async function getAllSupabasePosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select("*");

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  // get the frontmatter from the content
  const posts = await Promise.all(
    data.map(async (post) => {
      // split the content into frontmatter and content and format frontmatter as an object
      const frontmatter = post.content.split("---")[1];
      const content = post.content.split("---")[2];
      const frontmatterObject = frontmatter
        .split("\n")
        .reduce((acc: any, line: string) => {
          const [key, value] = line.split(": ");
          acc[key] = value;
          return acc;
        }, {});

      return {
        ...post,
        slug: post.slug,
        title: frontmatterObject.title,
        description: frontmatterObject.description,
        date: frontmatterObject.date,
        author: frontmatterObject.author,
        topic: frontmatterObject.topic,
        featured_image_url: frontmatterObject.featured_image_url,
        content,
      };
    })
  );
  return posts;
}

export async function getSupabasePost(slug: string): Promise<BlogPost | null> {
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

  // split the content into frontmatter and content and format frontmatter as an object
  const frontmatter = data.content.split("---")[1];
  const content = data.content.split("---")[2];
  const frontmatterObject = frontmatter
    .split("\n")
    .reduce((acc: any, line: string) => {
      const [key, value] = line.split(": ");
      acc[key] = value;
      return acc;
    }, {});

  return {
    ...data,
    slug: data.slug,
    title: frontmatterObject.title,
    description: frontmatterObject.description,
    date: frontmatterObject.date,
    author: frontmatterObject.author,
    topic: frontmatterObject.topic,
    featured_image_url: frontmatterObject.featured_image_url,
    content,
  };
}
