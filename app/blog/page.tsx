import { BlogList } from "./blog-list";
import { getAllPosts } from "../lib/blog";

export default async function BlogPage() {
  const posts = await getAllPosts("local"); // For now, we'll only show local posts

  return <BlogList posts={posts} />;
}
