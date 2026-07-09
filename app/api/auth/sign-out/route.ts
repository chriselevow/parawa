import { NextResponse } from "next/server"

import { ROLE_COOKIE, SESSION_SOURCE_COOKIE, USER_COOKIE } from "@/lib/roles"

const expiredCookieOptions = {
  httpOnly: true,
  maxAge: 0,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
}

export async function POST() {
  const response = NextResponse.json({ ok: true })

  for (const cookieName of [ROLE_COOKIE, USER_COOKIE, SESSION_SOURCE_COOKIE]) {
    response.cookies.set(cookieName, "", expiredCookieOptions)
  }

  return response
}
