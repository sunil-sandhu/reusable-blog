"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import { MDXRenderer } from "./mdx-renderer";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
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
  const commonClassName = `prose prose-lg max-w-none 
    prose-headings:text-black prose-headings:font-serif
    prose-p:text-black prose-p:font-serif prose-p:leading-relaxed prose-p:mb-6
    prose-a:text-black prose-a:underline hover:prose-a:opacity-70
    prose-img:w-full prose-img:h-auto prose-img:my-8
    prose-pre:bg-gray-100 prose-pre:border prose-pre:border-solid prose-pre:border-gray-300
    prose-hr:border-gray-300
    prose-blockquote:border-l-4 prose-blockquote:border-gray-400 prose-blockquote:font-serif
    prose-strong:text-black prose-strong:font-serif
    prose-ul:font-serif prose-ul:my-6 prose-ul:pl-6
    prose-li:mb-2 prose-li:font-serif
    prose-ol:font-serif prose-ol:my-6 prose-ol:pl-6
    ${className}`;


  // Skip first line if it matches the title (any heading level or plain text)
  const processedContent = title
    ? content.replace(new RegExp(`^(#{1,6}\\s*)?${title}\\n`, "m"), "")
    : content;

  if (isMDX) {
    return (
      <article className={commonClassName}>
        <MDXRenderer source={processedContent} />
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
        components={{
          h2: ({ node, ...props }) => (
            <h2
              {...props}
              style={{ scrollMarginTop: "100px" }}
              className="scroll-mt-24"
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              {...props}
              style={{ scrollMarginTop: "100px" }}
              className="scroll-mt-24"
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              {...props}
              style={{ scrollMarginTop: "100px" }}
              className="scroll-mt-24"
            />
          ),
          table: ({ children, ...props }) => (
            <Table {...props}>{children}</Table>
          ),
          thead: ({ children, ...props }) => (
            <TableHeader {...props}>{children}</TableHeader>
          ),
          tbody: ({ children, ...props }) => (
            <TableBody {...props}>{children}</TableBody>
          ),
          tr: ({ children, ...props }) => (
            <TableRow {...props}>{children}</TableRow>
          ),
          th: ({ children, ...props }) => (
            <TableHead {...props}>{children}</TableHead>
          ),
          td: ({ children, ...props }) => (
            <TableCell {...props}>{children}</TableCell>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </article>
  );
}
