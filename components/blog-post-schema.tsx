interface BlogPostSchemaProps {
  post: {
    id?: string;
    title: string;
    description?: string;
    author?: string;
    date: string;
    slug: string;
    featured_image_url?: string;
    topic?: string;
    content: string;
  };
  faqs?: Array<{ question: string; answer: string }>;
  baseUrl: string;
  organizationName: string;
}

export function BlogPostSchema({
  post,
  faqs,
  baseUrl,
  organizationName,
}: BlogPostSchemaProps) {
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const datePublished = post.date ? new Date(post.date).toISOString() : new Date().toISOString();
  const dateModified = post.date ? new Date(post.date).toISOString() : new Date().toISOString();

  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: organizationName,
    url: baseUrl,
  };

  // Person schema for author
  const authorSchema = post.author
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: post.author,
        url: `${baseUrl}/authors/${post.author.toLowerCase().replace(/\s+/g, "-")}`,
      }
    : null;

  // TechArticle schema (better for technical content, falls back to Article)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle", // Use TechArticle for technical blog posts, or "Article" for general content
    headline: post.title,
    description: post.description || post.title,
    ...(post.featured_image_url && {
      image: [
        {
          "@type": "ImageObject",
          url: post.featured_image_url,
          width: 1200,
          height: 630,
        },
      ],
    }),
    datePublished: datePublished,
    dateModified: dateModified,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author,
        }
      : {
          "@type": "Organization",
          name: organizationName,
        },
    publisher: {
      "@type": "Organization",
      name: organizationName,
      url: baseUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    articleSection: post.topic || undefined,
    keywords: post.topic ? [post.topic] : undefined,
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${baseUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  // FAQPage schema (if FAQs exist)
  const faqSchema =
    faqs && faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema, null, 2),
        }}
      />

      {/* Author Person Schema */}
      {authorSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(authorSchema, null, 2),
          }}
        />
      )}

      {/* TechArticle Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema, null, 2),
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema, null, 2),
        }}
      />

      {/* FAQPage Schema (if FAQs exist) */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema, null, 2),
          }}
        />
      )}
    </>
  );
}
