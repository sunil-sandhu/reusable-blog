"use client";

import Link from "next/link";
import { BlogPost } from "../lib/blog/types";

interface BlogListProps {
  posts: BlogPost[];
}

export function BlogList({ posts }: BlogListProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
      <div className="grid gap-8">
        {posts.map((post) => {
          // Format the date
          const formattedDate = new Date(post.date).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          );

          return (
            <article key={post.slug} className="border-b border-border pb-8">
              <Link href={`/blog/${post.slug}`} className="group">
                <h2 className="text-2xl font-semibold mb-2 group-hover:text-brand transition-colors">
                  {post.title}
                </h2>
                {post.date && (
                  <time
                    className="text-sm text-gray-500 mb-2 block"
                    dateTime={post.date}
                  >
                    {formattedDate}
                  </time>
                )}
                <p className="text-gray-600 dark:text-gray-300">
                  {post.description}
                </p>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
