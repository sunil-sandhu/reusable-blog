import { slugify } from "./utils";

export interface Heading {
  level: number;
  text: string;
  slug: string;
}

/**
 * Strips markdown syntax from text
 * Removes: bold (**text**), italic (*text*), links ([text](url)), code (`text`), etc.
 */
function stripMarkdown(text: string): string {
  // Remove code blocks and inline code
  text = text.replace(/`[^`]+`/g, "");
  // Remove links but keep the text: [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
  // Remove bold: **text** or __text__ -> text
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  // Remove italic: *text* or _text_ -> text
  text = text.replace(/\*([^*]+)\*/g, "$1");
  text = text.replace(/_([^_]+)_/g, "$1");
  // Remove strikethrough: ~~text~~ -> text
  text = text.replace(/~~([^~]+)~~/g, "$1");
  // Remove images: ![alt](url) -> alt
  text = text.replace(/!\[([^\]]*)\]\([^\)]+\)/g, "$1");
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, "");
  // Clean up extra spaces
  text = text.trim().replace(/\s+/g, " ");
  
  return text;
}

/**
 * Extracts h2-h4 headings from markdown content
 * Returns an array of headings with their level, text, and slug
 */
export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  
  // Regex to match h2, h3, h4 headings (both ATX style ## and Setext style ===/---)
  // ATX style: ## Heading
  // Setext style: Heading\n===\n or Heading\n---\n
  const lines = markdown.split("\n");
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for ATX style headings (##, ###, ####)
    const atxMatch = line.match(/^(#{2,4})\s+(.+)$/);
    if (atxMatch) {
      const level = atxMatch[1].length; // Number of # characters
      const rawText = atxMatch[2];
      const text = stripMarkdown(rawText);
      
      if (text) {
        headings.push({
          level,
          text,
          slug: slugify(text),
        });
      }
      continue;
    }
    
    // Check for Setext style headings (h2: ===, h3: ---)
    if (i < lines.length - 1) {
      const nextLine = lines[i + 1].trim();
      if (nextLine.match(/^=+$/)) {
        // h2 style
        const text = stripMarkdown(line);
        if (text) {
          headings.push({
            level: 2,
            text,
            slug: slugify(text),
          });
        }
        i++; // Skip the next line (the ===)
        continue;
      } else if (nextLine.match(/^-+$/)) {
        // h3 style
        const text = stripMarkdown(line);
        if (text) {
          headings.push({
            level: 3,
            text,
            slug: slugify(text),
          });
        }
        i++; // Skip the next line (the ---)
        continue;
      }
    }
  }
  
  return headings;
}
