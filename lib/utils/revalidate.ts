"use server";

import { revalidatePath } from "next/cache";

export async function revalidatePages() {
  try {
    // Revalidate the home page
    revalidatePath("/");

    // Revalidate the blog page
    revalidatePath("/blog");

    return true;
  } catch (error) {
    console.error("Error revalidating pages:", error);
    return false;
  }
}
