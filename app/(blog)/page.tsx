import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { Button } from "@/components/ui/button";
import { createPublicClient } from "@/lib/supabase/server";
import { getWebsiteUrl } from "@/lib/website-urls";

export const revalidate = 86400; // Revalidate every 24 hours as fallback

async function getNetworkPosts() {
  try {
    const supabase = createPublicClient();

    // Build query - exclude current website's posts if WEBSITE_ID is set
    let postsQuery = supabase
      .from("posts")
      .select(
        "title, topic, created_at, website_id, slug, featured_image_url, author, website:websites(*)",
      )
      .order("created_at", { ascending: false })
      .limit(20); // Fetch more to ensure we get 6 with valid URLs after filtering

    // Exclude posts from current website if WEBSITE_ID is set
    if (process.env.WEBSITE_ID) {
      postsQuery = postsQuery.neq("website_id", process.env.WEBSITE_ID);
    }

    const { data: posts, error: postsError } = await postsQuery;

    if (postsError) {
      console.error("Error fetching network posts:", postsError);
      return [];
    }

    // Map the data to include website name, slug, and URL
    // Filter out posts that don't have a valid URL (from websites not in the mapping)
    // Limit to 6 posts with valid URLs
    const mappedPosts = posts
      .map((post) => {
        // Handle website as either object or array (defensive coding)
        const website = Array.isArray(post.website)
          ? post.website[0]
          : post.website;
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

    return mappedPosts;
  } catch (error) {
    console.error("Error fetching network posts:", error);
    return [];
  }
}

export default async function HomePage() {
  const allPosts = await getAllPosts("database");
  const networkPosts = await getNetworkPosts();

  // Featured post (first post)
  const featuredPost = allPosts[0];

  // Recent posts (next 6 posts for 3x2 grid)
  const recentPosts = allPosts.slice(1, 7);

  // Latest posts (next 6 posts for another 3x2 grid)
  const latestPosts = allPosts.slice(7, 13);

  // Featured posts for 2x2 grid (next 4 posts)
  const featuredPostsGrid = allPosts.slice(13, 17);

  return (
    <main className="w-full">
      {/* Featured Post Section */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-0">
          <Link href={`/blog/${featuredPost.slug}`} className="group">
            <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8">
              {/* Image */}
              <div className="w-full">
                {featuredPost.featured_image_url ? (
                  <div className="relative w-full aspect-video overflow-hidden">
                    <img
                      src={featuredPost.featured_image_url}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-gray-200" />
                )}
              </div>

              {/* Text Content */}
              <div className="flex flex-col justify-center">
                {featuredPost.topic && (
                  <span className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                    {featuredPost.topic}
                  </span>
                )}
                <h1 className="text-3xl lg:text-4xl font-mono font-bold mb-4 leading-tight">
                  {featuredPost.title}
                </h1>
                {featuredPost.description && (
                  <p className="text-gray-600 font-serif mb-6 leading-relaxed">
                    {featuredPost.description}
                  </p>
                )}
                {featuredPost.author && (
                  <span className="text-xs uppercase tracking-wide text-gray-500">
                    BY {featuredPost.author.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Recent Posts Grid (3x2) */}
      {recentPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <article className="flex flex-col">
                  {post.featured_image_url ? (
                    <div className="relative w-full aspect-video mb-4 overflow-hidden">
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full aspect-video mb-4 bg-gray-200" />
                  )}
                  {post.topic && (
                    <span className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                      {post.topic}
                    </span>
                  )}
                  <h3 className="text-lg font-mono font-normal mb-2 leading-tight">
                    {post.title}
                  </h3>
                  {post.author && (
                    <span className="text-xs uppercase tracking-wide text-gray-500">
                      BY {post.author.toUpperCase()}
                    </span>
                  )}
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Posts Section */}
      {latestPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xs uppercase tracking-wide text-black">
              LATEST POSTS
            </h2>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <article className="flex flex-col">
                  {post.featured_image_url ? (
                    <div className="relative w-full aspect-video mb-4 overflow-hidden">
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full aspect-video mb-4 bg-gray-200" />
                  )}
                  {post.topic && (
                    <span className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                      {post.topic}
                    </span>
                  )}
                  <h3 className="text-lg font-mono font-normal mb-2 leading-tight">
                    {post.title}
                  </h3>
                  {post.author && (
                    <span className="text-xs uppercase tracking-wide text-gray-500">
                      BY {post.author.toUpperCase()}
                    </span>
                  )}
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* View All Latest Posts Button */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-center">
          <Button
            asChild
            variant="outline"
            className="border-black text-black uppercase tracking-wide px-8 py-6 rounded-none hover:bg-black hover:text-white transition-colors"
          >
            <Link href="/blog">VIEW ALL LATEST POSTS</Link>
          </Button>
        </div>
      </section>

      {/* Featured Posts Grid (2x2) */}
      {featuredPostsGrid.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xs uppercase tracking-wide text-gray-500">
              FEATURED POSTS
            </h2>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredPostsGrid.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <article className="flex flex-col">
                  {post.featured_image_url ? (
                    <div className="relative w-full aspect-video mb-4 overflow-hidden">
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full aspect-video mb-4 bg-gray-200" />
                  )}
                  {post.topic && (
                    <span className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                      {post.topic}
                    </span>
                  )}
                  <h3 className="text-xl font-mono font-normal mb-2 leading-tight">
                    {post.title}
                  </h3>
                  {post.author && (
                    <span className="text-xs uppercase tracking-wide text-gray-500">
                      BY {post.author.toUpperCase()}
                    </span>
                  )}
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Posts Across the Network Section */}
      {networkPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xs uppercase tracking-wide text-black">
              POSTS ACROSS THE NETWORK
            </h2>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {networkPosts.map((post: any) => {
              // Network posts should always have a URL - if not, skip them
              if (!post.url) {
                return null;
              }

              return (
                <a
                  key={`${post.website_id}-${post.slug}`}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <article className="flex flex-col">
                    {post.featured_image_url ? (
                      <div className="relative w-full aspect-video mb-4 overflow-hidden">
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full aspect-video mb-4 bg-gray-200" />
                    )}
                    {post.topic && (
                      <span className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                        {post.topic}
                      </span>
                    )}
                    <h3 className="text-lg font-mono font-normal mb-2 leading-tight">
                      {post.title}
                    </h3>
                    <div className="flex flex-col gap-1">
                      {post.website_name && (
                        <span className="text-xs uppercase tracking-wide text-gray-500">
                          {post.website_name.toUpperCase()}
                        </span>
                      )}
                      {post.author && (
                        <span className="text-xs uppercase tracking-wide text-gray-500">
                          BY {post.author.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </article>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
