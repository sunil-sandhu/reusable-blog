"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import "prismjs/themes/prism-tomorrow.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <article
      className={`prose prose-lg dark:prose-invert max-w-none 
        prose-headings:text-heading dark:prose-headings:text-heading-dark
        prose-p:text-text dark:prose-p:text-text-dark
        prose-a:text-brand prose-a:no-underline hover:prose-a:underline 
        prose-img:rounded-xl 
        prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950
        prose-pre:border prose-pre:border-solid prose-pre:border-border dark:prose-pre:border-border-dark
        prose-hr:border-border dark:prose-hr:border-border-dark
        prose-blockquote:border-l-4 prose-blockquote:border-brand/30
        prose-strong:text-heading dark:prose-strong:text-heading-dark
        prose-ul:marker:text-gray-400 dark:prose-ul:marker:text-gray-600
        ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          rehypeRaw,
          [rehypePrism, { ignoreMissing: true }],
        ]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
