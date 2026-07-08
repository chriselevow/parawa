"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  type AppRole,
  destinationForRole,
  normalizeRole,
  ROLE_COOKIE,
  roleLabels,
  USER_COOKIE,
} from "@/lib/roles"

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14

type RoleIdentityOption = {
  id: string
  label: string
  detail?: string
}

function setSessionCookies(role: AppRole, userId?: string) {
  document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`
  window.localStorage.setItem(ROLE_COOKIE, role)

  if (userId) {
    document.cookie = `${USER_COOKIE}=${encodeURIComponent(userId)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`
    window.localStorage.setItem(USER_COOKIE, userId)
  } else {
    document.cookie = `${USER_COOKIE}=; path=/; max-age=0; samesite=lax`
    window.localStorage.removeItem(USER_COOKIE)
  }
}

function clearSessionCookies() {
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`
  document.cookie = `${USER_COOKIE}=; path=/; max-age=0; samesite=lax`
  window.localStorage.removeItem(ROLE_COOKIE)
  window.localStorage.removeItem(USER_COOKIE)
}

function getCurrentRole() {
  const cookieRole = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${ROLE_COOKIE}=`))
    ?.split("=")[1]

  return normalizeRole(cookieRole)
}

export function RoleLoginActions({
  identities,
  intent,
  nextPath,
}: {
  identities?: Partial<Record<AppRole, RoleIdentityOption>>
  intent: AppRole | null
  nextPath?: string
}) {
  const router = useRouter()
  const roles: AppRole[] =
    intent === "admin"
      ? ["admin"]
      : intent === "provider"
        ? ["provider", "client"]
        : ["client", "provider"]

  function signIn(role: AppRole) {
    setSessionCookies(role, identities?.[role]?.id)
    router.push(destinationForRole(role, nextPath))
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {roles.map((role, index) => {
        const identity = identities?.[role]

        return (
          <div key={role} className="grid gap-1.5">
            <Button
              type="button"
              variant={index === 0 ? "default" : "outline"}
              className="w-full"
              onClick={() => signIn(role)}
            >
              {role === "admin"
                ? "Entrar al admin interno"
                : `Continuar como ${roleLabels[role].toLowerCase()}`}
            </Button>
            {identity ? (
              <p className="break-anywhere px-1 text-center text-xs text-muted-foreground">
                Sesión demo: {identity.label}
                {identity.detail ? ` · ${identity.detail}` : ""}
              </p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function SignOutButton({
  role,
  redirectTo = "/",
}: {
  role: AppRole
  redirectTo?: string
}) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsVisible(getCurrentRole() === role)
    })

    return () => cancelAnimationFrame(frame)
  }, [role])

  if (!isVisible) return null

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 rounded-lg px-2.5 text-xs sm:px-3 sm:text-[0.8rem]"
      onClick={() => {
        clearSessionCookies()
        router.push(redirectTo)
      }}
    >
      <LogOutIcon data-icon="inline-start" />
      Salir
    </Button>
  )
}
