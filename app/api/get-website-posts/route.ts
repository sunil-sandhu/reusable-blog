import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteName = searchParams.get("website");

    if (!websiteName) {
      return NextResponse.json(
        { error: "Website name is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // First, get the website ID
    const { data: website, error: websiteError } = await supabase
      .from("websites")
      .select("id")
      .eq("name", websiteName)
      .single();

    if (websiteError || !website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Then, get all posts for that website
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("*, website:websites(*)")
      .eq("website_id", website.id)
      .order("created_at", { ascending: false });

    if (postsError) {
      return NextResponse.json(
        { error: "Error fetching posts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        description: post.description,
        date: post.created_at,
        author: post.author,
        topic: post.topic,
        featured_image_url: post.featured_image_url,
        created_at: post.created_at,
        website: {
          id: post.website.id,
          name: post.website.name,
        },
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
