import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 86400; // Revalidate every 24 hours as fallback

async function getPaginatedPosts(page: number = 1, limit: number = 18) {
  try {
    const supabase = await createClient();
    const offset = (page - 1) * limit;

    // Build query - filter by WEBSITE_ID if set
    let postsQuery = supabase
      .from("posts")
      .select("title, topic, created_at, slug, featured_image_url, author", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (process.env.WEBSITE_ID) {
      postsQuery = postsQuery.eq("website_id", process.env.WEBSITE_ID);
    }

    const { data: posts, error, count } = await postsQuery;

    if (error) {
      console.error("Error fetching posts:", error);
      return { posts: [], pagination: null };
    }

    const totalPosts = count || 0;
    const totalPages = Math.ceil(totalPosts / limit);

    return {
      posts: posts || [],
      pagination: {
        page,
        limit,
        total: totalPosts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching paginated posts:", error);
    return { posts: [], pagination: null };
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const postsPerPage = 18;
  
  const { posts, pagination } = await getPaginatedPosts(currentPage, postsPerPage);

  return (
    <main className="w-full">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="border-t border-gray-300 pt-8 mb-8">
          <h1 className="text-xs uppercase tracking-wide text-black mb-8">ALL POSTS</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
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

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-4">
            {pagination.hasPreviousPage && (
              <Button
                asChild
                variant="outline"
                className="border-black text-black uppercase tracking-wide px-6 py-3 rounded-none hover:bg-black hover:text-white transition-colors"
              >
                <Link href={`/blog?page=${currentPage - 1}`}>Previous</Link>
              </Button>
            )}
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    asChild
                    variant={currentPage === pageNum ? "default" : "outline"}
                    className={
                      currentPage === pageNum
                        ? "bg-black text-white uppercase tracking-wide px-4 py-2 rounded-none hover:bg-gray-800 transition-colors"
                        : "border-black text-black uppercase tracking-wide px-4 py-2 rounded-none hover:bg-black hover:text-white transition-colors"
                    }
                  >
                    <Link href={`/blog?page=${pageNum}`}>{pageNum}</Link>
                  </Button>
                );
              })}
            </div>

            {pagination.hasNextPage && (
              <Button
                asChild
                variant="outline"
                className="border-black text-black uppercase tracking-wide px-6 py-3 rounded-none hover:bg-black hover:text-white transition-colors"
              >
                <Link href={`/blog?page=${currentPage + 1}`}>Next</Link>
              </Button>
            )}
          </div>
        )}

        {pagination && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Showing {((currentPage - 1) * postsPerPage) + 1} - {Math.min(currentPage * postsPerPage, pagination.total)} of {pagination.total} posts
          </div>
        )}
      </section>
    </main>
  );
}
