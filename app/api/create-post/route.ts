// create a route that will create a post in the database

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const supabase = await createClient();

  const { slug, content, website_id } = await req.json();

  const { data, error } = await supabase.from("posts").insert({
    slug,
    content,
    website_id,
  });

  return NextResponse.json({ data, error });
}
