import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Post slug is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: post, error } = await supabase
      .from("posts")
      .select("*, website:websites(*)")
      .eq("slug", slug)
      .single();

    if (error) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        description: post.description,
        date: post.created_at,
        author: post.author,
        topic: post.topic,
        featured_image_url: post.featured_image_url,
        created_at: post.created_at,
        content: post.content,
        website: {
          id: post.website.id,
          name: post.website.name,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
