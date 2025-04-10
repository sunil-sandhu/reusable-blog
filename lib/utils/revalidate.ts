export async function revalidatePages() {
  try {
    const response = await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: process.env.REVALIDATION_SECRET,
        path: "/",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to revalidate home page");
    }

    const blogResponse = await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: process.env.REVALIDATION_SECRET,
        path: "/blog",
      }),
    });

    if (!blogResponse.ok) {
      throw new Error("Failed to revalidate blog page");
    }

    return true;
  } catch (error) {
    console.error("Error revalidating pages:", error);
    return false;
  }
}
