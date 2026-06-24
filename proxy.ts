import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="buyma-dashboard"' },
  });
}

export function proxy(request: NextRequest) {
  const user = process.env.DASHBOARD_USER;
  const password = process.env.DASHBOARD_PASSWORD;

  if (!user || !password) return NextResponse.next();

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) return unauthorized();

  const decoded = atob(authHeader.slice("Basic ".length));
  const separatorIndex = decoded.indexOf(":");
  const reqUser = decoded.slice(0, separatorIndex);
  const reqPassword = decoded.slice(separatorIndex + 1);

  if (reqUser !== user || reqPassword !== password) return unauthorized();

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/analyze"],
};
