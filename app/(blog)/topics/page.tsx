import Link from "next/link";
import { getTopics } from "@/lib/blog";
import { slugify } from "@/lib/utils";

export const revalidate = 86400; // Revalidate every 24 hours

export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <main className="w-full">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="border-t border-gray-300 pt-8 mb-8">
          <h1 className="text-xs uppercase tracking-wide text-black mb-8">TOPICS</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topics.map((topic) => (
            <Link
              key={topic}
              href={`/topics/${slugify(topic)}`}
              className="text-sm text-black hover:opacity-70 transition-opacity capitalize"
            >
              {topic}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
