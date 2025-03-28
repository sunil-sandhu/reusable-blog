import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogPost } from "./types";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export async function getAllLocalPosts(): Promise<BlogPost[]> {
  const files = fs.readdirSync(BLOG_DIR);

  const posts = files
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => {
      const filePath = path.join(BLOG_DIR, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContent);
      const slug = file.replace(/\.(md|mdx)$/, "");

      return {
        slug,
        title: data.title,
        description: data.description,
        content,
        date: data.date,
        topic: data.topic,
        author: data.author,
        featured_image_url: data.featured_image_url,
        isMDX: file.endsWith(".mdx"),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

export async function getLocalPost(slug: string): Promise<BlogPost | null> {
  try {
    // Try both .md and .mdx extensions
    const mdPath = path.join(BLOG_DIR, `${slug}.md`);
    const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);

    let filePath: string;
    let isMDX = false;

    if (fs.existsSync(mdxPath)) {
      filePath = mdxPath;
      isMDX = true;
    } else if (fs.existsSync(mdPath)) {
      filePath = mdPath;
    } else {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title,
      description: data.description,
      content,
      date: data.date,
      topic: data.topic,
      author: data.author,
      featured_image_url: data.featured_image_url,
      isMDX,
    };
  } catch (error) {
    return null;
  }
}
