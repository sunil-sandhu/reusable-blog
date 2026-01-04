"use client";

import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { ThemeSwitcher } from "./theme-switcher";
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
        ThemeSwitcher,
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
