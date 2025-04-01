import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const websites = [
  { id: "61175361-7a81-4947-b826-2b0174eaae44", name: "test" },
  {
    id: "1bec3555-8ca2-46a9-a497-187500a45b35",
    name: "cubed",
  },
  {
    id: "e9e78dca-8727-4e70-9037-0e1127ad397c",
    name: "stackademic",
  },
  {
    id: "ef1b69cf-7cdb-4ebe-849f-463b1a2ad58e",
    name: "venture",
  },
];

export async function POST() {
  try {
    const supabase = await createClient();
    const contentDir = path.join(process.cwd(), "content/blog");
    const files = fs.readdirSync(contentDir);
    const results = [];

    for (const file of files) {
      if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;

      const filePath = path.join(contentDir, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data: frontmatter, content } = matter(fileContent);
      const slug = file.replace(/\.(md|mdx)$/, "");

      // Create frontmatter in the same format as create/page.tsx
      const formattedFrontmatter = {
        title: frontmatter.title || "",
        description: frontmatter.description || "",
        date: frontmatter.date || new Date().toISOString(),
        ...(frontmatter.author && { author: frontmatter.author }),
        ...(frontmatter.topic && {
          topic: Array.isArray(frontmatter.topic)
            ? frontmatter.topic
            : [frontmatter.topic],
        }),
        ...(frontmatter.featured_image_url && {
          featured_image_url: frontmatter.featured_image_url,
        }),
      };

      // Combine frontmatter and content in the same format
      const fullContent = `---
${Object.entries(formattedFrontmatter)
  .map(
    ([key, value]) =>
      `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
  )
  .join("\n")}
---

${content}`;

      const { data, error } = await supabase.from("posts").insert({
        slug,
        content: fullContent,
        website_id: websites.find((w) => w.name === "cubed")?.id,
      });

      results.push({ file, success: !error, error });
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
