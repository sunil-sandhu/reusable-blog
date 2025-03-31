import { slugify } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "./badge";
import { BlogPost } from "@/lib/blog/types";

interface BlogPostHeaderProps {
  post: BlogPost;
}

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  // Format the date
  const formattedDate = new Date(post.date || "").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="w-full mx-auto mb-12 pt-12 pb-12 lg:pt-24 lg:pb-24 bg-gradient-to-t from-brand/40 to-brand/10">
      <div className="max-w-7xl p-0 mx-auto w-full text-center">
        <div className="space-y-6 text-center">
          {post.topic && <Badge label={post.topic} directory="topics" />}

          {/* Title */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight px-4">
              {post.title}
            </h1>
          </div>

          {/* Author and Date */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm justify-center">
            {post.author && (
              <div className="flex items-center gap-1.5">
                <span className="text-text dark:text-gray-500">By</span>
                <p className="font-medium text-heading dark:text-gray-200 hover:text-brand dark:hover:text-brand transition-colors">
                  <Link href={`/authors/${slugify(post.author)}`}>
                    {post.author}
                  </Link>
                </p>
              </div>
            )}
            {post.date && (
              <div className="flex items-center gap-1.5">
                <span className="text-text dark:text-gray-500 mr-1">•</span>
                <span className="font-medium">Published on</span>
                <time className="text-sm text-gray-500">{formattedDate}</time>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
