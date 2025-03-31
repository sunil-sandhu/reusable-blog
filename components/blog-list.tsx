"use client";

import Link from "next/link";
import { BlogPost } from "../lib/blog/types";
import { Badge } from "@/components/badge";

interface BlogListProps {
  posts: BlogPost[];
}

export function BlogList({ posts }: BlogListProps) {
  return (
    <div className="grid gap-8">
      {posts.map((post) => {
        // Format the date
        const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return (
          <article key={post.slug} className="border-b border-border pb-8">
            {post.topic && <Badge label={post.topic} directory="topics" />}
            <Link href={`/blog/${post.slug}`} className="group">
              <div className="flex flex-col p-2">
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
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
