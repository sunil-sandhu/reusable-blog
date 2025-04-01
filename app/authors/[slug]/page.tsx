import { BlogList } from "@/components/blog-list";
import { getPostsByAuthor } from "@/lib/blog";

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = await getPostsByAuthor(slug);
  return (
    <main className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          {slug
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase())}
        </h1>
        <BlogList posts={posts} />
      </div>
    </main>
  );
}
