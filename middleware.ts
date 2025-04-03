import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyPassword } from "./lib/auth";

// This should be moved to environment variables in production
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const ADMIN_PASSWORD_SALT = process.env.ADMIN_PASSWORD_SALT || "";

export async function middleware(request: NextRequest) {
  // Only protect admin routes
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Check for basic auth header
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    console.log("No auth header or invalid format");
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    });
  }

  // Decode auth header
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");

  console.log("Attempting login with:", { username, hasPassword: !!password });

  // Verify credentials
  const isValidPassword = await verifyPassword(
    password,
    ADMIN_PASSWORD_HASH,
    ADMIN_PASSWORD_SALT
  );
  console.log("Password verification result:", isValidPassword);

  if (username === ADMIN_USERNAME && isValidPassword) {
    console.log("Login successful");
    return NextResponse.next();
  }

  console.log("Login failed");
  return new NextResponse("Invalid credentials", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area"',
    },
  });
}

export const config = {
  matcher: "/admin/:path*",
};
