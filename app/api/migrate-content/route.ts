import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const websites = [
  { id: "61175361-7a81-4947-b826-2b0174eaae44", name: "Test" },
  {
    id: "1bec3555-8ca2-46a9-a497-187500a45b35",
    name: "Cubed",
  },
  {
    id: "e9e78dca-8727-4e70-9037-0e1127ad397c",
    name: "Stackademic",
  },
  {
    id: "ef1b69cf-7cdb-4ebe-849f-463b1a2ad58e",
    name: "Venture Magazine",
  },
];

function extractFirstImageUrl(content: string): string | null {
  const match = content.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : null;
}

export async function POST() {
  try {
    const supabase = await createClient();
    const contentDir = path.join(process.cwd(), `content/${process.env.NEXT_PUBLIC_WEBSITE_NAME}`);
    const files = fs.readdirSync(contentDir);
    const results = [];

    for (const file of files) {
      if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;

      const filePath = path.join(contentDir, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const slug = file.replace(/\.(md|mdx)$/, "");

      // Extract first image URL from content
      const firstImageUrl = extractFirstImageUrl(fileContent);

      const { data, error } = await supabase.from("posts").insert({
        slug,
        content: fileContent,
        website_id: websites.find((w) => w.name === process.env.NEXT_PUBLIC_WEBSITE_NAME)?.id,
        title: slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        description: "",
        author: "",
        topic: "",
        featured_image_url: firstImageUrl || "",
      });

      results.push({ file, success: !error, error });
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
