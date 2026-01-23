import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getWebsiteUrl } from "@/lib/website-urls";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const websiteIdParam = searchParams.get("website_id");

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

    // Parse website_id filter (supports comma-separated values for multiple websites)
    // If WEBSITE_ID env var is set and no website_id param is provided, use the env var
    let websiteIds: string[] | null = null;
    if (websiteIdParam) {
      websiteIds = websiteIdParam.split(",").map((id) => id.trim()).filter(Boolean);
      if (websiteIds.length === 0) {
        return NextResponse.json(
          { error: "Invalid website_id parameter" },
          { status: 400 }
        );
      }
    } else if (process.env.WEBSITE_ID) {
      // Use WEBSITE_ID from environment if no param is provided
      websiteIds = [process.env.WEBSITE_ID];
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build count query with optional website filter
    let countQuery = supabase.from("posts").select("*", { count: "exact", head: true });
    if (websiteIds) {
      countQuery = countQuery.in("website_id", websiteIds);
    }

    // Get total count
    const { count, error: countError } = await countQuery;

    if (countError) {
      return NextResponse.json(
        { error: "Error fetching post count" },
        { status: 500 }
      );
    }

    const totalPosts = count || 0;
    const totalPages = Math.ceil(totalPosts / limit);

    // Build posts query with optional website filter
    let postsQuery = supabase
      .from("posts")
      .select("title, topic, created_at, website_id, slug, featured_image_url, author, website:websites(*)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (websiteIds) {
      postsQuery = postsQuery.in("website_id", websiteIds);
    }

    // Fetch paginated posts with website information joined
    const { data: posts, error: postsError } = await postsQuery;

    if (postsError) {
      return NextResponse.json(
        { error: "Error fetching posts" },
        { status: 500 }
      );
    }

    // Map the data to include website name, slug, and URL
    const mappedPosts = posts.map((post) => {
      // Handle website as either object or array (defensive coding)
      const website = Array.isArray(post.website) ? post.website[0] : post.website;
      const websiteName = website?.name || null;
      const slug = post.slug;
      const url = getWebsiteUrl(post.website_id, slug);

      return {
        title: post.title,
        topic: post.topic,
        date: post.created_at,
        website_id: post.website_id,
        website_name: websiteName,
        slug: slug,
        url: url,
        featured_image_url: post.featured_image_url,
        author: post.author,
      };
    });

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
