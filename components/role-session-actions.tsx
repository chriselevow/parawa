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
} from "@/lib/roles"

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14

function setRoleCookie(role: AppRole) {
  document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`
  window.localStorage.setItem(ROLE_COOKIE, role)
}

function clearRoleCookie() {
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`
  window.localStorage.removeItem(ROLE_COOKIE)
}

function getCurrentRole() {
  const cookieRole = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${ROLE_COOKIE}=`))
    ?.split("=")[1]

  return normalizeRole(cookieRole)
}

export function RoleLoginActions({
  intent,
  nextPath,
}: {
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
    setRoleCookie(role)
    router.push(destinationForRole(role, nextPath))
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {roles.map((role, index) => (
        <Button
          key={role}
          type="button"
          variant={index === 0 ? "default" : "outline"}
          className="w-full"
          onClick={() => signIn(role)}
        >
          {role === "admin"
            ? "Entrar al admin interno"
            : `Continuar como ${roleLabels[role].toLowerCase()}`}
        </Button>
      ))}
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
    setIsVisible(getCurrentRole() === role)
  }, [role])

  if (!isVisible) return null

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 rounded-lg px-2.5 text-xs sm:px-3 sm:text-[0.8rem]"
      onClick={() => {
        clearRoleCookie()
        router.push(redirectTo)
      }}
    >
      <LogOutIcon data-icon="inline-start" />
      Salir
    </Button>
  )
}
