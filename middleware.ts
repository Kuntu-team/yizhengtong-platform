import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token_yk")?.value;
  if (!token && request.nextUrl.pathname !== "/login") {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 可选：只拦截部分路由
export const config = {
  matcher: [
    // 只拦截不是 login、api、_next、favicon.ico、public 的所有页面
    "/((?!login|api|_next|favicon.ico|public).*)",
  ],
};
