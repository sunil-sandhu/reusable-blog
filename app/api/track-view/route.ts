import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Lightweight API endpoint to track blog post views
 * Usage: GET /api/track-view?slug=your-post-slug
 * 
 * This endpoint increments the view count for a post by slug.
 * It's designed to be called from any website and is optimized for performance.
 * 
 * Example usage from any website:
 * fetch('https://your-domain.com/api/track-view?slug=my-post-slug')
 */
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

    // First, get the current post to check if it exists and get current views
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("id, views")
      .eq("slug", slug)
      .single();

    if (fetchError || !post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Increment views atomically
    const newViews = (post.views || 0) + 1;
    const { error: updateError } = await supabase
      .from("posts")
      .update({ views: newViews })
      .eq("id", post.id);

    if (updateError) {
      console.error("Error updating views:", updateError);
      return NextResponse.json(
        { error: "Failed to track view" },
        { status: 500 }
      );
    }

    // Return success with new view count
    return NextResponse.json(
      { success: true, views: newViews },
      { 
        status: 200,
        headers: {
          // Allow CORS for cross-origin requests from other websites
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
        }
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
