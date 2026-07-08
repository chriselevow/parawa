export const ROLE_COOKIE = "parawa_role"

export type AppRole = "client" | "provider" | "admin"

export const roleLabels: Record<AppRole, string> = {
  client: "Cliente",
  provider: "Proveedor",
  admin: "Admin",
}

export const roleDestinations: Record<AppRole, string> = {
  client: "/discover",
  provider: "/provider",
  admin: "/admin",
}

export function normalizeRole(value: unknown): AppRole | null {
  if (value === "client" || value === "provider" || value === "admin") {
    return value
  }

  return null
}

export function safeNextPath(value: unknown) {
  if (typeof value !== "string") return undefined
  if (!value.startsWith("/") || value.startsWith("//")) return undefined

  return value
}

export function requiredRoleForPath(pathname: string): AppRole | null {
  if (pathname === "/provider" || pathname.startsWith("/provider/")) {
    return "provider"
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return "admin"
  }

  if (
    pathname === "/bookings" ||
    pathname.startsWith("/bookings/") ||
    pathname === "/messages" ||
    pathname.startsWith("/messages/")
  ) {
    return "client"
  }

  return null
}

export function destinationForRole(role: AppRole, nextPath?: string) {
  if (nextPath) {
    const requiredRole = requiredRoleForPath(nextPath)

    if (requiredRole === role) {
      return nextPath
    }

    if (
      role === "client" &&
      (nextPath === "/discover" || nextPath.startsWith("/providers/"))
    ) {
      return nextPath
    }
  }

  return roleDestinations[role]
}
