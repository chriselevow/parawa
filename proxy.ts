import { NextResponse, type NextRequest } from "next/server"

import { normalizeRole, requiredRoleForPath, ROLE_COOKIE } from "@/lib/roles"

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const requiredRole = requiredRoleForPath(pathname)

  if (!requiredRole) {
    return NextResponse.next()
  }

  const activeRole = normalizeRole(request.cookies.get(ROLE_COOKIE)?.value)

  if (activeRole === requiredRole) {
    return NextResponse.next()
  }

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = "/login"
  loginUrl.search = ""
  loginUrl.searchParams.set("role", requiredRole)
  loginUrl.searchParams.set("next", `${pathname}${search}`)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/bookings/:path*",
    "/messages/:path*",
    "/provider/:path*",
  ],
}
