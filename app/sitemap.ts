import { MetadataRoute } from "next";
import { getAllDatabasePosts } from "@/lib/blog/database";

type ChangeFreq =
  | "daily"
  | "weekly"
  | "always"
  | "hourly"
  | "monthly"
  | "yearly"
  | "never";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  // Get all blog posts from Supabase
  const posts = await getAllDatabasePosts();

  // Generate static page entries
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as ChangeFreq,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily" as ChangeFreq,
      priority: 0.8,
    },
  ];

  // Generate blog post entries
  const blogEntries = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date || new Date()),
    changeFrequency: "weekly" as ChangeFreq,
    priority: 0.6,
  }));

  return [...staticPages, ...blogEntries];
}
