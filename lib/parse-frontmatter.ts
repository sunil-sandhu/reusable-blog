import { load } from "js-yaml";

interface Frontmatter {
    title?: string;
    description?: string;
    date?: string;
    topic?: string;
    author?: string;
    featured_image_url?: string;
  }
  
  
  export function parseFrontmatter(content: string): {
    data: Frontmatter;
    content: string;
  } {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return { data: {}, content };
    }
  
    try {
      const frontmatter = load(frontmatterMatch[1]) as Frontmatter;
      const contentWithoutFrontmatter = content.replace(
        /^---\n[\s\S]*?\n---\n/,
        ""
      );
      return { data: frontmatter || {}, content: contentWithoutFrontmatter };
    } catch (error) {
      return { data: {}, content };
    }
  }