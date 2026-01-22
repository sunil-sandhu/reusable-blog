import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTopics } from "@/lib/blog";
import { slugify } from "@/lib/utils";

export async function Footer() {
  const topics = await getTopics();
  
  // Split topics into 4 columns for categories section
  const topicsPerColumn = Math.ceil(topics.length / 4);
  const topicColumns = [
    topics.slice(0, topicsPerColumn),
    topics.slice(topicsPerColumn, topicsPerColumn * 2),
    topics.slice(topicsPerColumn * 2, topicsPerColumn * 3),
    topics.slice(topicsPerColumn * 3),
  ];

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Row - Branding and Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b border-gray-700">
          <h2 className="text-3xl font-bold uppercase mb-4 md:mb-0">
            {process.env.NEXT_PUBLIC_WEBSITE_NAME || "The Blog"}
          </h2>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_WEBSITE_NAME || "The Blog"}™. ALL RIGHTS RESERVED
          </p>
        </div>

        {/* Mid-Section - Navigation and Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Categories */}
          <div className="lg:col-span-4">
            <h3 className="text-xs uppercase tracking-wide mb-4 text-white">CATEGORIES</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {topicColumns.map((column, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-2">
                  {column.map((topic) => (
                    <Link
                      key={topic}
                      href={`/topics/${slugify(topic)}`}
                      className="text-sm text-white hover:opacity-70 transition-opacity capitalize"
                    >
                      {topic}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h3 className="text-xs uppercase tracking-wide mb-4 text-gray-400">SUBSCRIBE TO NEWSLETTER</h3>
            <Button
              asChild
              className="bg-white text-black hover:bg-gray-200 transition-colors rounded-none"
            >
              <a
                href="https://newsletter.plainenglish.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                Subscribe
              </a>
            </Button>
          </div>
        </div>

        {/* Information and Follow Us */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-700">
          {/* <div>
            <h3 className="text-xs uppercase tracking-wide mb-4 text-white">INFORMATION</h3>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-white hover:opacity-70 transition-opacity">
                about
              </Link>
              <Link href="/contact" className="text-sm text-white hover:opacity-70 transition-opacity">
                contact
              </Link>
              <Link href="/terms" className="text-sm text-white hover:opacity-70 transition-opacity">
                terms
              </Link>
            </div>
          </div> */}

          <div>
            <h3 className="text-xs uppercase tracking-wide mb-4 text-white">FOLLOW US</h3>
            <div className="flex flex-col gap-2">
              <a
                href="https://instagram.com/inplainenglish"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white hover:opacity-70 transition-opacity"
              >
                instagram
              </a>
              <a
                href="https://linkedin.com/company/inplainenglish"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white hover:opacity-70 transition-opacity"
              >
                linkedin
              </a>
              <a
                href="https://twitter.com/inPlainEngHQ"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white hover:opacity-70 transition-opacity"
              >
                twitter
              </a>
            </div>
          </div>

          <div>

            {/* <div className="flex flex-col gap-2">
              <span className="text-sm text-white">In Plain English Ltd © {new Date().getFullYear()}</span>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
