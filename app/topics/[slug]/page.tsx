import { getPostsByTopic } from "@/lib/blog";
import { BlogList } from "@/components/blog-list";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = await getPostsByTopic(slug);
  return (
    <main className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="mx-auto">
        <h1 className="text-5xl font-bold mb-6">{slug.replace(/-/g, " ")}</h1>
        <BlogList posts={posts} />
      </div>
    </main>
  );
}
