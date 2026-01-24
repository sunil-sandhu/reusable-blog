import { MarkdownRenderer } from "@/components/markdown-renderer";
import { BlogPostHeader } from "@/components/blog-post-header";
import { InlineTableOfContents } from "@/components/inline-table-of-contents";
import { FAQSection } from "@/components/faq-section";
import { BlogPostSchema } from "@/components/blog-post-schema";
import { ViewTracker } from "@/components/view-tracker";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPost } from "@/lib/blog";
import { createClient } from "@/lib/supabase/server";
import { getWebsiteUrl } from "@/lib/website-urls";



export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  if (!process.env.NEXT_PUBLIC_WEBSITE_NAME || !process.env.NEXT_PUBLIC_URL) {
    console.warn("NEXT_PUBLIC_WEBSITE_NAME or NEXT_PUBLIC_URL is not set");
    return {};
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL;
  const blogName = process.env.NEXT_PUBLIC_WEBSITE_NAME;

  const { slug } = await params;
  const post = await getPost(slug, "database");
  if (!post) {
    notFound();
  }
  return {
    title: post.title,
    description: post.description || "",
    keywords: [post.topic || ""],
    publisher: blogName,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [post.featured_image_url || ""],
      url: `${baseUrl}/blog/${post.slug}`,
      type: "article",
      siteName: blogName,
      locale: "en_US",
      authors: [post.author || ""],
      tags: [post.topic || ""],
      publishedTime: post.date || "",
      modifiedTime: post.date || "",
    },
  };
}

async function getNetworkPosts() {
  try {
    const supabase = await createClient();

    // Build query - exclude current website's posts if WEBSITE_ID is set
    let postsQuery = supabase
      .from("posts")
      .select("title, topic, created_at, website_id, slug, featured_image_url, author, website:websites(*)")
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

    return mappedPosts;
  } catch (error) {
    console.error("Error fetching network posts:", error);
    return [];
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPost(slug, "database");

  if (!post) {
    notFound();
  }

  // Fetch FAQ if post has an ID
  let faqs = null;
  if (post.id) {
    const supabase = await createClient();
    const { data: faqData } = await supabase
      .from("post_faqs")
      .select("faq_content, visible")
      .eq("post_id", post.id)
      .eq("visible", true)
      .single();

    if (faqData && faqData.faq_content && Array.isArray(faqData.faq_content)) {
      faqs = faqData.faq_content;
    }
  }

  const networkPosts = await getNetworkPosts();

  // Get base URL and organization name for schema
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";
  const organizationName = process.env.NEXT_PUBLIC_WEBSITE_NAME || "";

  return (
    <>
      {/* Track page view (production only) */}
      <ViewTracker slug={slug} />

      {/* Comprehensive Schema Markup for AEO */}
      <BlogPostSchema
        post={post}
        faqs={faqs || [] as {
          question: string;
          answer: string;
        }[]}
        baseUrl={baseUrl}
        organizationName={organizationName}
      />

      <article className="relative w-full mx-auto bg-white" itemScope itemType="https://schema.org/TechArticle">
        {/* Header section */}
        <BlogPostHeader post={post} />

      {/* Hero Image */}
      {post.featured_image_url && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="w-full overflow-hidden" itemScope itemType="https://schema.org/ImageObject" itemProp="image">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-auto object-cover"
              itemProp="url"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <InlineTableOfContents content={post.content} />
        <MarkdownRenderer
          content={post.content}
          isMDX={post.isMDX}
          title={post.title}
        />
      </div>

      {/* FAQ Section */}
      {faqs && faqs.length > 0 && (
        <FAQSection faqs={faqs} postTitle={post.title} />
      )}

      {/* Posts Across the Network Section */}
      {networkPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-300">
          <div className="pt-8 mb-8">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xs uppercase tracking-wide text-black">POSTS ACROSS THE NETWORK</h2>
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
          </div>
        </section>
      )}
      </article>
    </>
  );
}
