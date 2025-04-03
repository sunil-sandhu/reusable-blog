interface WebsitePost {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  author: string;
  topic: string;
  featured_image_url: string;
  created_at: string;
  website: {
    id: string;
    name: string;
  };
}

interface GetWebsitePostsResponse {
  posts: WebsitePost[];
  error?: string;
}

/**
 * Fetches all posts for a specific website from the API
 * @param baseUrl - The base URL of the API (e.g., "https://your-api.com")
 * @param websiteName - The name of the website to fetch posts for
 * @returns Promise containing the posts or an error
 */
export async function getWebsitePosts(
  baseUrl: string,
  websiteName: string
): Promise<GetWebsitePostsResponse> {
  try {
    const response = await fetch(
      `${baseUrl}/api/get-website-posts?website=${encodeURIComponent(
        websiteName
      )}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        posts: [],
        error: errorData.error || "Failed to fetch website posts",
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      posts: [],
      error: "Failed to fetch website posts",
    };
  }
}

/**
 * Fetches a specific post by its slug from the API
 * @param baseUrl - The base URL of the API (e.g., "https://your-api.com")
 * @param slug - The slug of the post to fetch
 * @returns Promise containing the post or an error
 */
export async function getPost(
  baseUrl: string,
  slug: string
): Promise<{
  post: (WebsitePost & { content: string }) | null;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${baseUrl}/api/get-post?slug=${encodeURIComponent(slug)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        post: null,
        error: errorData.error || "Failed to fetch post",
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      post: null,
      error: "Failed to fetch post",
    };
  }
}
