"use client";

import { extractHeadings, Heading } from "@/lib/extract-headings";
import { useEffect, useState } from "react";
import Link from "next/link";

interface InlineTableOfContentsProps {
  content: string;
}

export function InlineTableOfContents({ content }: InlineTableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const extractedHeadings = extractHeadings(content);
    // Filter to only h2-h4 as requested
    const filteredHeadings = extractedHeadings.filter(
      (h) => h.level >= 2 && h.level <= 4
    );
    setHeadings(filteredHeadings);
  }, [content]);

  // Handle smooth scroll with offset for navbar
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the #
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          const navbarHeight = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    };

    // Handle initial hash on page load
    if (window.location.hash) {
      // Small delay to ensure DOM is ready
      setTimeout(handleHashChange, 100);
    }

    // Handle hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <h2 className="text-lg font-semibold text-black font-serif mb-4">
        Table of Contents
      </h2>
      <nav>
        <ul className="space-y-2">
          {headings.map((heading, index) => (
            <li
              key={`${heading.slug}-${index}`}
              className={`${
                heading.level === 3
                  ? "pl-4"
                  : heading.level === 4
                  ? "pl-8"
                  : ""
              }`}
            >
              <Link
                href={`#${heading.slug}`}
                className="text-left text-black font-serif hover:text-gray-700 hover:underline transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(heading.slug);
                  if (element) {
                    const navbarHeight = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

                    window.history.pushState({}, "", `#${heading.slug}`);
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth",
                    });
                  }
                }}
              >
                {heading.text}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
