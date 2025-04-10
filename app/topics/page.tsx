import { getTopics } from "@/lib/blog";
import { Badge } from "@/components/badge";

export const revalidate = 86400; // Revalidate every 24 hours

export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <main className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="mx-auto">
        <h1 className="text-5xl font-bold mb-6">Topics</h1>
        <ul>
          {topics.map((topic) => (
            <Badge key={topic} label={topic} directory="topics" />
          ))}
        </ul>
      </div>
    </main>
  );
}
