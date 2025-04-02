import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { dump } from "js-yaml";
import { parseFrontmatter } from "@/lib/parse-frontmatter";

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

function extractFirstImageUrl(content: string): string | null {
  const match = content.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : null;
}

export async function POST() {
  try {
    const supabase = await createClient();
    const contentDir = path.join(process.cwd(), "content/venture");
    const files = fs.readdirSync(contentDir);
    const results = [];

    for (const file of files) {
      if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;

      const filePath = path.join(contentDir, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data: frontmatter, content } = parseFrontmatter(fileContent);
      const slug = file.replace(/\.(md|mdx)$/, "");

      // Extract first image URL from content
      const firstImageUrl = extractFirstImageUrl(content);

      // Create new frontmatter with standardized fields
      const newFrontmatter = {
        author: Array.isArray(frontmatter.author)
          ? frontmatter.author[0] || ""
          : frontmatter.author || "",
        title: frontmatter.title || "",
        date: frontmatter.date || new Date().toISOString(),
        topic: Array.isArray(frontmatter.topic)
          ? frontmatter.topic[0] || ""
          : frontmatter.topic || "",
        description: frontmatter.description || "",
        featured_image_url: firstImageUrl || "",
      };

      // Convert frontmatter to YAML
      const yamlStr = dump(newFrontmatter, {
        lineWidth: -1,
        noRefs: true,
        sortKeys: false,
        quotingType: '"',
      });

      // Combine frontmatter and content
      const fullContent = `---
${yamlStr}---

${content}`;

      const { data, error } = await supabase.from("posts").insert({
        slug,
        content: fullContent,
        website_id: websites.find((w) => w.name === "venture")?.id,
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
