/**
 * Map website IDs to their URL patterns
 * This function generates the full URL for a post based on its website_id and slug
 */
export function getWebsiteUrl(websiteId: string | null, slug: string): string | null {
  if (!websiteId || !slug) return null;

  const urlPatterns: Record<string, string> = {
    "c019f26c-8310-4166-ab71-a954c0de0bf3": "https://plainenglish.io/blog",
    "ef1b69cf-7cdb-4ebe-849f-463b1a2ad58e": "https://venturemagazine.net/blog",
    "1bec3555-8ca2-46a9-a497-187500a45b35": "https://cubed.run/blog",
    "e9e78dca-8727-4e70-9037-0e1127ad397c": "https://stackademic.com/blog",
  };

  const baseUrl = urlPatterns[websiteId];
  if (!baseUrl) {
    // Differ and any other websites without active links
    return null;
  }

  return `${baseUrl}/${slug}`;
}
