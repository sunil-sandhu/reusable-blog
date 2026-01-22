import { slugify } from "@/lib/utils";
import Link from "next/link";
import { BlogPost } from "@/lib/blog/types";

interface BlogPostHeaderProps {
  post: BlogPost;
}

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  return (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-6">
        {/* Category Tag */}
        {post.topic && (
          <span className="text-xs uppercase tracking-wide text-gray-500 block">
            {post.topic}
          </span>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-black">
          {post.title}
        </h1>

        {/* Author with Avatar */}
        {post.author && (
          <div className="flex items-center gap-3">
            {/* Avatar - using a placeholder circle for now */}
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <Link
              href={`/authors/${slugify(post.author)}`}
              className="text-sm font-normal text-black hover:opacity-70 transition-opacity"
            >
              {post.author.toUpperCase()}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
