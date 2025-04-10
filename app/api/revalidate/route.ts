import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { secret, path } = await request.json();

    // Check for secret to confirm this is a valid request
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    if (!path) {
      return NextResponse.json(
        { message: "Path is required" },
        { status: 400 }
      );
    }

    // Revalidate the path
    revalidatePath(path);

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating" },
      { status: 500 }
    );
  }
}
