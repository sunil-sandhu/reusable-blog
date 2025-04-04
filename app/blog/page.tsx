import { BlogList } from "../../components/blog-list";
import { getAllPosts } from "../../lib/blog";

export default async function BlogPage() {
  const posts = await getAllPosts("database");

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <h1 className="text-5xl font-bold mb-20">
        Blog Posts
      </h1>
      <BlogList posts={posts} />
    </div>
  );
}
