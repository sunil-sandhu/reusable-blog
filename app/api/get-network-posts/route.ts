import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getWebsiteUrl } from "@/lib/website-urls";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch posts across all websites
    // We fetch more than 6 to account for filtering out posts without valid URLs
    // Only select fields needed for previews
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("title, topic, created_at, website_id, slug, featured_image_url, author, website:websites(*)")
      .order("created_at", { ascending: false })
      .limit(20); // Fetch more to ensure we get 6 with valid URLs after filtering

    if (postsError) {
      return NextResponse.json(
        { error: "Error fetching network posts" },
        { status: 500 }
      );
    }

    // Map the data to include website name, slug, and URL
    // For network posts, always use the full URL from getWebsiteUrl
    // Filter out posts that don't have a valid URL (from websites not in the mapping)
    // Limit to 6 posts with valid URLs
    const mappedPosts = posts
      .map((post) => {
        // Handle website as either object or array (defensive coding)
        const website = Array.isArray(post.website) ? post.website[0] : post.website;
        const websiteName = website?.name || null;
        const slug = post.slug;
        const url = getWebsiteUrl(post.website_id, slug);

        // Only include posts that have a valid URL
        if (!url) {
          return null;
        }

        return {
          title: post.title,
          topic: post.topic,
          date: post.created_at,
          website_id: post.website_id,
          website_name: websiteName,
          slug: slug,
          url: url, // Always use the full URL for network posts
          featured_image_url: post.featured_image_url,
          author: post.author,
        };
      })
      .filter((post): post is NonNullable<typeof post> => post !== null)
      .slice(0, 6); // Limit to 6 posts

    return NextResponse.json({
      posts: mappedPosts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
