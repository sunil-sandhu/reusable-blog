import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyPassword } from "./lib/auth";

// Admin account credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const ADMIN_PASSWORD_SALT = process.env.ADMIN_PASSWORD_SALT || "";

// Editor account credentials
const EDITOR_USERNAME = process.env.EDITOR_USERNAME || "editor";
const EDITOR_PASSWORD_HASH = process.env.EDITOR_PASSWORD_HASH || "";
const EDITOR_PASSWORD_SALT = process.env.EDITOR_PASSWORD_SALT || "";

// Buyer account credentials
const BUYER_USERNAME = process.env.BUYER_USERNAME || "buyer";
const BUYER_PASSWORD_HASH = process.env.BUYER_PASSWORD_HASH || "";
const BUYER_PASSWORD_SALT = process.env.BUYER_PASSWORD_SALT || "";

const ADMIN_ENABLED = process.env.ADMIN_ENABLED === "true";

export async function middleware(request: NextRequest) {
  // Only protect admin routes
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // If admin is disabled, return 404 to make it appear as if the route doesn't exist
  if (!ADMIN_ENABLED) {
    return new NextResponse("Not Found", {
      status: 404,
    });
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

  // Check admin account
  if (
    username === ADMIN_USERNAME &&
    ADMIN_PASSWORD_HASH &&
    ADMIN_PASSWORD_SALT
  ) {
    const isValidPassword = await verifyPassword(
      password,
      ADMIN_PASSWORD_HASH,
      ADMIN_PASSWORD_SALT
    );
    if (isValidPassword) {
      console.log("Login successful (admin account)");
      return NextResponse.next();
    }
  }

  // Check editor account
  if (
    username === EDITOR_USERNAME &&
    EDITOR_PASSWORD_HASH &&
    EDITOR_PASSWORD_SALT
  ) {
    const isValidPassword = await verifyPassword(
      password,
      EDITOR_PASSWORD_HASH,
      EDITOR_PASSWORD_SALT
    );
    if (isValidPassword) {
      console.log("Login successful (editor account)");
      return NextResponse.next();
    }
  }

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
      console.log("Login successful (buyer account)");
      return NextResponse.next();
    }
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
