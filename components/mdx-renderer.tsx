"use client";

import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface MDXRendererProps {
  source: string;
}

export function MDXRenderer({ source }: MDXRendererProps) {
  const [serializedSource, setSerializedSource] = useState<any>(null);

  useEffect(() => {
    const serializeMDX = async () => {
      const serialized = await serialize(source, {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      });
      setSerializedSource(serialized);
    };
    serializeMDX();
  }, [source]);

  if (!serializedSource) return null;

  return (
    <MDXRemote
      {...serializedSource}
      components={{
        Button,
        h2: ({ ...props }) => <h2 {...props} className="scroll-mt-24" />,
        h3: ({ ...props }) => <h3 {...props} className="scroll-mt-24" />,
        h4: ({ ...props }) => <h4 {...props} className="scroll-mt-24" />,
        table: Table,
        thead: TableHeader,
        tbody: TableBody,
        tr: TableRow,
        th: TableHead,
        td: TableCell,
      }}
    />
  );
}
