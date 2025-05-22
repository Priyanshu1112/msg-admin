import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    // You can add custom logic here based on pathname or token
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow access if the user has a valid token
        return !!token;

        // Optional: skip auth in development
        // if (process.env.NODE_ENV === "development") {
        //   return true;
        // }
      },
    },
  }
);

// Protect all routes except the ones listed
export const config = {
  matcher: [
    "/((?!login|privacy-policy|assets|api/auth|api/slack|_next|static|favicon.ico|sitemap.xml|.*\\.svg$).*)",
  ],
};
