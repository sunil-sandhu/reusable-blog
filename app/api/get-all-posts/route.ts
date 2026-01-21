import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Validate pagination parameters
    if (page < 1) {
      return NextResponse.json(
        { error: "Page must be greater than 0" },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 100" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count
    const { count, error: countError } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json(
        { error: "Error fetching post count" },
        { status: 500 }
      );
    }

    const totalPosts = count || 0;
    const totalPages = Math.ceil(totalPosts / limit);

    // Fetch paginated posts with website information joined
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("title, topic, created_at, website_id, website:websites(*)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      return NextResponse.json(
        { error: "Error fetching posts" },
        { status: 500 }
      );
    }

    // Map the data to include website name
    const mappedPosts = posts.map((post) => ({
      title: post.title,
      topic: post.topic,
      date: post.created_at,
      website_id: post.website_id,
      website_name: post.website?.name || null,
    }));

    return NextResponse.json({
      posts: mappedPosts,
      pagination: {
        page,
        limit,
        total: totalPosts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
