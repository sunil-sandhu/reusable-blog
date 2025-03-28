"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import { MDXRenderer } from "./mdx-renderer";
import "prismjs/themes/prism-tomorrow.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isMDX?: boolean;
  title?: string;
}

export function MarkdownRenderer({
  content,
  className = "",
  isMDX = false,
  title,
}: MarkdownRendererProps) {
  const commonClassName = `prose prose-lg dark:prose-invert max-w-none 
    prose-headings:text-foreground dark:prose-headings:text-foreground
    prose-p:text-foreground/80 dark:prose-p:text-foreground/80
    prose-a:text-brand prose-a:no-underline hover:prose-a:underline 
    prose-img:rounded-xl 
    prose-pre:bg-background/95 dark:prose-pre:bg-background/95
    prose-pre:border prose-pre:border-solid prose-pre:border-border dark:prose-pre:border-border
    prose-hr:border-border dark:prose-hr:border-border
    prose-blockquote:border-l-4 prose-blockquote:border-brand/30
    prose-strong:text-foreground dark:prose-strong:text-foreground
    prose-ul:marker:text-foreground/60 dark:prose-ul:marker:text-foreground/60
    ${className}`;

  // Skip first line if it matches the title (any heading level or plain text)
  const processedContent = title
    ? content.replace(new RegExp(`^(#{1,6}\\s*)?${title}\\n`, "m"), "")
    : content;

  if (isMDX) {
    return (
      <article className={commonClassName}>
        <MDXRenderer source={processedContent} title={title} />
      </article>
    );
  }

  return (
    <article className={commonClassName}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          rehypeRaw,
          [rehypePrism, { ignoreMissing: true }],
        ]}
      >
        {processedContent}
      </ReactMarkdown>
    </article>
  );
}
