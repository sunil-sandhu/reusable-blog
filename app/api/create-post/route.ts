// // Example usage from external app
// const username = 'admin'; // or 'editor'
// const password = 'your-password';

// const credentials = btoa(`${username}:${password}`);

// const response = await fetch('https://your-blog-site.com/api/create-post', {
//   method: 'POST',
//   headers: {
//     'Authorization': `Basic ${credentials}`,
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({
//     title: 'My New Post',
//     description: 'Post description',
//     author: 'John Doe',
//     topic: 'Technology',
//     featured_image_url: 'https://example.com/image.jpg',
//     content: '# My Post Content\n\nThis is the markdown content.',
//     website_id: 'your-website-uuid',
//     // slug is optional - will be auto-generated from title
//   }),
// });

// const result = await response.json();

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";

// // Admin account credentials
// const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
// const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
// const ADMIN_PASSWORD_SALT = process.env.ADMIN_PASSWORD_SALT || "";

// // Editor account credentials
// const EDITOR_USERNAME = process.env.EDITOR_USERNAME || "editor";
// const EDITOR_PASSWORD_HASH = process.env.EDITOR_PASSWORD_HASH || "";
// const EDITOR_PASSWORD_SALT = process.env.EDITOR_PASSWORD_SALT || "";

// Buyer account credentials
const BUYER_USERNAME = process.env.BUYER_USERNAME || "buyer";
const BUYER_PASSWORD_HASH = process.env.BUYER_PASSWORD_HASH || "";
const BUYER_PASSWORD_SALT = process.env.BUYER_PASSWORD_SALT || "";

async function verifyAuth(authHeader: string | null): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  // Decode auth header
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");

  // Check admin account
  // if (
  //   username === ADMIN_USERNAME &&
  //   ADMIN_PASSWORD_HASH &&
  //   ADMIN_PASSWORD_SALT
  // ) {
  //   const isValidPassword = await verifyPassword(
  //     password,
  //     ADMIN_PASSWORD_HASH,
  //     ADMIN_PASSWORD_SALT
  //   );
  //   if (isValidPassword) {
  //     return true;
  //   }
  // }

  // Check editor account
  // if (
  //   username === EDITOR_USERNAME &&
  //   EDITOR_PASSWORD_HASH &&
  //   EDITOR_PASSWORD_SALT
  // ) {
  //   const isValidPassword = await verifyPassword(
  //     password,
  //     EDITOR_PASSWORD_HASH,
  //     EDITOR_PASSWORD_SALT
  //   );
  //   if (isValidPassword) {
  //     return true;
  //   }
  // }

  // Check buyer account
  if (
    username === BUYER_USERNAME &&
    BUYER_PASSWORD_HASH &&
    BUYER_PASSWORD_SALT
  ) {
    const isValidPassword = await verifyPassword(
      password,
      BUYER_PASSWORD_HASH,
      BUYER_PASSWORD_SALT
    );
    if (isValidPassword) {
      return true;
    }
  }

  return false;
}

export async function POST(req: Request) {
  // Verify authorization
  const authHeader = req.headers.get("authorization");
  const isAuthorized = await verifyAuth(authHeader);

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="API Access"',
        },
      }
    );
  }

  const supabase = await createClient();

  try {
    const {
      title,
      description,
      author,
      topic,
      featured_image_url,
      content,
      website_id,
      slug, // Optional: can be generated from title if not provided
    } = await req.json();

    // Generate slug from title if not provided
    const finalSlug =
      slug ||
      title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") ||
      "";

    // Validate required fields
    if (!title || !content || !website_id || !finalSlug) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, content, website_id are required",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.from("posts").insert({
      title,
      description: description || "",
      author: author || "",
      topic: topic || "",
      featured_image_url: featured_image_url || "",
      content,
      slug: finalSlug,
      website_id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Revalidate pages after successful post creation
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || req.url.split("/api")[0];
      const revalidateSecret = process.env.REVALIDATION_SECRET;

      if (revalidateSecret) {
        // Revalidate home page
        await fetch(`${baseUrl}/api/revalidate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            secret: revalidateSecret,
            path: "/",
          }),
        });

        // Revalidate blog page
        await fetch(`${baseUrl}/api/revalidate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            secret: revalidateSecret,
            path: "/blog",
          }),
        });
      }
    } catch (revalidateError) {
      // Log but don't fail the request if revalidation fails
      console.error("Revalidation error:", revalidateError);
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
