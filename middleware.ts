import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token_yk")?.value;
  // 允许未登录访问 /login 相关页面
  const publicPaths = ["/login"];
  // 允许所有 /policies 及其子路径（如 /policies/xxx）
  if (
    !token &&
    !publicPaths.some(
      (path) =>
        request.nextUrl.pathname === path ||
        request.nextUrl.pathname.startsWith("/policies/") ||
        request.nextUrl.pathname.startsWith("/visualization/")
    )
  ) {
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
