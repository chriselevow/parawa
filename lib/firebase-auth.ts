import "server-only"

import { cookies } from "next/headers"

import {
  getFirebaseDocument,
  hasFirebaseReadConfig,
} from "@/lib/firebase-readonly"
import {
  type AppRole,
  destinationForRole,
  normalizeRole,
  ROLE_COOKIE,
  safeNextPath,
  USER_COOKIE,
} from "@/lib/roles"

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14

type FirebaseAuthResponse = {
  email?: string
  idToken: string
  localId: string
  refreshToken?: string
}

type FirebaseAuthErrorResponse = {
  error?: {
    message?: string
  }
}

type FirebaseUserProfile = Record<string, unknown>

export type FirebaseLoginSession = {
  destination: string
  email: string
  role: AppRole
  roleSource: "admin-email" | "requested-role" | "users"
  userId: string
}

function text(value: unknown, fallback = "") {
  if (typeof value === "string") return value.trim() || fallback
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return fallback
}

function getFirebaseWebApiKey() {
  return (
    process.env.PARAWA_FIREBASE_WEB_API_KEY ??
    process.env.FIREBASE_WEB_API_KEY ??
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    ""
  ).trim()
}

function configuredAdminEmails() {
  return new Set(
    (process.env.PARAWA_ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
}

function isConfiguredAdminEmail(email: string) {
  return configuredAdminEmails().has(email.toLowerCase())
}

function authErrorMessage(message: string | undefined) {
  switch (message) {
    case "EMAIL_NOT_FOUND":
    case "INVALID_LOGIN_CREDENTIALS":
    case "INVALID_PASSWORD":
      return "No pudimos validar ese correo y contraseña en Firebase."
    case "USER_DISABLED":
      return "Esta cuenta está desactivada en Firebase Auth."
    case "TOO_MANY_ATTEMPTS_TRY_LATER":
      return "Firebase bloqueó temporalmente el acceso por demasiados intentos."
    default:
      return "Firebase Auth no pudo completar el inicio de sesión."
  }
}

function profileRole(
  profile: FirebaseUserProfile | null,
  email: string
): { role: AppRole; source: FirebaseLoginSession["roleSource"] } | null {
  if (isConfiguredAdminEmail(email)) {
    return { role: "admin", source: "admin-email" }
  }

  const directRole = normalizeRole(text(profile?.role).toLowerCase())
  if (directRole) return { role: directRole, source: "users" }

  const accountType = text(profile?.accountType || profile?.type).toLowerCase()
  if (accountType === "provider") return { role: "provider", source: "users" }
  if (accountType === "admin") return { role: "admin", source: "users" }

  return profile ? { role: "client", source: "users" } : null
}

async function signInWithPassword(email: string, password: string) {
  const apiKey = getFirebaseWebApiKey()
  if (!apiKey) {
    throw new Error(
      "Falta PARAWA_FIREBASE_WEB_API_KEY o NEXT_PUBLIC_FIREBASE_API_KEY."
    )
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
      cache: "no-store",
    }
  )

  const json = (await response.json()) as
    | FirebaseAuthResponse
    | FirebaseAuthErrorResponse

  if (!response.ok || !("localId" in json)) {
    const errorMessage = "error" in json ? json.error?.message : undefined

    throw new Error(authErrorMessage(errorMessage))
  }

  return json
}

export async function createFirebaseLoginSession({
  email,
  nextPath,
  password,
  requestedRole,
}: {
  email: string
  nextPath?: string
  password: string
  requestedRole: AppRole
}): Promise<FirebaseLoginSession> {
  const firebaseUser = await signInWithPassword(email, password)
  const profile = hasFirebaseReadConfig()
    ? await getFirebaseDocument<FirebaseUserProfile>(
        "users",
        firebaseUser.localId
      )
    : null
  const resolvedRole = profileRole(
    profile?.data ?? null,
    firebaseUser.email ?? email
  )
  const role =
    resolvedRole ??
    (requestedRole === "admin"
      ? null
      : ({ role: requestedRole, source: "requested-role" } as const))

  if (!role) {
    throw new Error(
      "La cuenta inició sesión, pero no tiene perfil admin configurado para Parawa."
    )
  }

  if (role.role !== requestedRole) {
    throw new Error(
      `Esta cuenta está registrada como ${role.role}; entra desde la vista correcta.`
    )
  }

  const cookieStore = await cookies()
  const cookieOptions = {
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  }

  cookieStore.set(ROLE_COOKIE, role.role, cookieOptions)
  cookieStore.set(USER_COOKIE, firebaseUser.localId, cookieOptions)

  return {
    destination: destinationForRole(role.role, safeNextPath(nextPath)),
    email: firebaseUser.email ?? email,
    role: role.role,
    roleSource: role.source,
    userId: firebaseUser.localId,
  }
}
