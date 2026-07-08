import "server-only"

import { cookies } from "next/headers"

import { normalizeRole, ROLE_COOKIE, USER_COOKIE } from "@/lib/roles"

function decodeCookieValue(value: string | undefined) {
  if (!value) return undefined

  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export async function getActiveSession() {
  const cookieStore = await cookies()

  return {
    role: normalizeRole(cookieStore.get(ROLE_COOKIE)?.value),
    userId: decodeCookieValue(cookieStore.get(USER_COOKIE)?.value),
  }
}
