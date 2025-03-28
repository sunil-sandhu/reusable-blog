"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

interface Heading {
  level: number;
  text: string;
  slug: string;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const generateTOC = () => {
      const headingElements = document.querySelectorAll<HTMLHeadingElement>(
        "article h2, article h3, article h4, article h5, article h6"
      );

      const headingsData = Array.from(headingElements).map((heading) => {
        const level = parseInt(heading.tagName[1]);
        const text = heading.textContent || "";
        const slug = text
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, "");

        // Add ID to heading if it doesn't exist
        if (!heading.id) {
          heading.id = slug;
          heading.style.scrollMarginTop = "200px";
        }

        return {
          level,
          text,
          slug,
        };
      });

      setHeadings(headingsData);
    };

    // Set up MutationObserver to watch for content changes
    const observer = new MutationObserver((mutations) => {
      const hasNewHeadings = mutations.some((mutation) => {
        return Array.from(mutation.addedNodes).some((node) => {
          return (
            node instanceof HTMLElement &&
            (node.tagName.startsWith("H") ||
              node.querySelector("h2, h3, h4, h5, h6"))
          );
        });
      });

      if (hasNewHeadings) {
        generateTOC();
      }
    });

    // Start observing the article element
    const article = document.querySelector("article");
    if (article) {
      observer.observe(article, {
        childList: true,
        subtree: true,
      });
    }

    // Initial generation
    generateTOC();

    // Add intersection observer for active heading
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            // Update URL hash when scrolling to a heading
            const url = new URL(window.location.href);
            url.hash = entry.target.id;
            window.history.pushState({}, "", url);
          }
        });
      },
      {
        rootMargin: "0px 0px -100% 0px",
      }
    );

    // Observe all heading elements
    document
      .querySelectorAll<HTMLHeadingElement>(
        "article h2, article h3, article h4, article h5, article h6"
      )
      .forEach((element) => {
        intersectionObserver.observe(element);
      });

    // Cleanup
    return () => {
      observer.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  const scrollToHeading = (slug: string) => {
    const element = document.getElementById(slug);
    if (!element) return;

    const navbarHeight = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed left-0 top-48 z-50 hidden lg:flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Toggle Button */}
      <button className="bg-foreground text-background p-2 w-8 rounded-r-lg hover:rounded-r-none shadow-lg hover:bg-foreground/90  transition-all duration-300 flex flex-col h-48">
        <div className="flex flex-col items-center justify-between h-full">
          <span className="text-xs font-medium whitespace-nowrap rotate-90 mt-12">
            Table of Contents
          </span>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${
              isHovered ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Table of Contents Panel */}
      <div
        className={`bg-background shadow-lg rounded-r-lg transition-all duration-300 ease-in-out ${
          isHovered ? "w-64 opacity-100" : "w-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="p-4 w-64">
          <p className="text-sm font-semibold uppercase tracking-wider text-subtext mb-4">
            Table of Contents
          </p>
          <ul className="space-y-2.5 text-sm">
            {headings.map((heading, index) => (
              <li
                key={`${heading.slug}-${index}`}
                className={`${
                  heading.level > 2 ? `pl-${(heading.level - 2) * 4}` : ""
                }`}
              >
                <button
                  onClick={() => scrollToHeading(heading.slug)}
                  className={`
                    block w-full text-left py-1 transition-colors duration-200
                    ${
                      heading.slug === activeId
                        ? "text-brand font-medium"
                        : "text-text"
                    }
                    hover:text-brand
                  `}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
