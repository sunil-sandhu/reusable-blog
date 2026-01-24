interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  postTitle?: string;
}

export function FAQSection({ faqs, postTitle }: FAQSectionProps) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Generate FAQPage schema for SEO (Google's recommended format)
  const faqSchema = {
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
  };

  return (
    <>
      {/* FAQPage Schema Markup is now handled in BlogPostSchema component */}

      {/* FAQ Section - Fully visible and accessible */}
      <section
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-300"
        aria-label="Frequently Asked Questions"
        id="faq"
      >
        <header className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-black mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-gray-600 font-serif">
            Common questions about this topic
          </p>
        </header>

        <div className="space-y-8" role="list">
          {faqs.map((faq, index) => (
            <article
              key={index}
              itemScope
              itemType="https://schema.org/Question"
              className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0"
              role="listitem"
            >
              <h3
                className="text-xl font-serif font-bold text-black mb-4"
                itemProp="name"
              >
                {faq.question}
              </h3>
              <div
                itemScope
                itemType="https://schema.org/Answer"
                itemProp="acceptedAnswer"
              >
                <p
                  className="text-base text-black font-serif leading-relaxed whitespace-pre-wrap"
                  itemProp="text"
                >
                  {faq.answer}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
