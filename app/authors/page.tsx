import { getAuthors } from "@/lib/blog";
import { Badge } from "@/components/badge";

export default async function TopicsPage() {
  const authors = await getAuthors();

  return (
    <main className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="mx-auto">
        <h1 className="text-5xl font-bold mb-6">Authors</h1>
        <ul>
          {authors.map((author) => (
            <Badge key={author} label={author} directory="authors" />
          ))}
        </ul>
      </div>
    </main>
  );
}
