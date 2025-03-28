"use client";

import { useEffect, useState } from "react";

interface Heading {
  level: number;
  text: string;
  slug: string;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isClickNavigating, setIsClickNavigating] = useState<boolean>(false);

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

          // Create anchor wrapper
          const anchor = document.createElement("a");
          anchor.href = `#${slug}`;
          anchor.className = "hashAnchor";
          // Add scroll-margin-top to the heading
          heading.style.scrollMarginTop = "200px"; // Adjust this value to match your navbar height

          // Wrap heading with anchor
          heading.parentNode?.insertBefore(anchor, heading);
          anchor.appendChild(heading);
        }

        return {
          level,
          text,
          slug,
        };
      });

      setHeadings(headingsData);
    };

    // Generate TOC when component mounts
    generateTOC();

    // Add intersection observer
    const callback = (entries: IntersectionObserverEntry[]) => {
      if (!isClickNavigating) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      }
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: "0px 0px -100% 0px",
    });

    // Observe all heading elements
    document
      .querySelectorAll<HTMLHeadingElement>(
        "article h2, article h3, article h4, article h5, article h6"
      )
      .forEach((element) => {
        observer.observe(element);
      });

    // Cleanup
    return () => {
      observer.disconnect();
      // Remove anchor wrappers
      document.querySelectorAll(".hashAnchor").forEach((anchor) => {
        const heading = anchor.firstChild;
        if (heading && anchor.parentNode) {
          anchor.parentNode.insertBefore(heading, anchor);
        }
        anchor.remove();
      });
    };
  }, [isClickNavigating]);

  const handleLinkClick = (
    slug: string,
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault(); // Prevent default anchor behavior
    setActiveId(slug);
    setIsClickNavigating(true);

    const element = document.getElementById(slug);
    if (!element) return;

    const navbarHeight = 80; // Adjust this to match your navbar height
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    // Re-enable intersection observer after animation
    setTimeout(() => {
      setIsClickNavigating(false);
    }, 100);
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-8 pr-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-subtext dark:text-gray-400 mb-4">
        Table of Contents
      </h2>
      <ul className="space-y-2.5 text-sm">
        {headings.map((heading, index) => (
          <li
            key={`${heading.slug}-${index}`}
            className={`${
              heading.level > 2 ? `pl-${(heading.level - 2) * 4}` : ""
            }`}
          >
            <a
              href={`#${heading.slug}`}
              onClick={(e) => handleLinkClick(heading.slug, e)}
              className={`
                block py-1 transition-colors duration-200
                ${
                  heading.slug === activeId
                    ? "text-brand dark:text-brand font-medium"
                    : "text-text dark:text-gray-300"
                }
                hover:text-brand dark:hover:text-brand
              `}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
