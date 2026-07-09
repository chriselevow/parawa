"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  KeyRoundIcon,
  LogOutIcon,
  MailIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  type AppRole,
  destinationForRole,
  normalizeRole,
  ROLE_COOKIE,
  roleLabels,
  USER_COOKIE,
} from "@/lib/roles"
import { cn } from "@/lib/utils"

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14

type RoleIdentityOption = {
  id: string
  label: string
  detail?: string
}

type FirebaseLoginResponse = {
  destination?: string
  email?: string
  error?: string
  role?: AppRole
  roleSource?: "admin-email" | "requested-role" | "users"
  userId?: string
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

function setLocalSession(role: AppRole, userId?: string) {
  window.localStorage.setItem(ROLE_COOKIE, role)

  if (userId) {
    window.localStorage.setItem(USER_COOKIE, userId)
  } else {
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
  const [selectedRole, setSelectedRole] = useState<AppRole>(roles[0])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authFeedback, setAuthFeedback] = useState<{
    detail: string
    title: string
    tone: "error" | "success"
  } | null>(null)
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false)

  function resetAuthFeedback() {
    setAuthFeedback(null)
  }

  function signIn(role: AppRole) {
    setSessionCookies(role, identities?.[role]?.id)
    router.push(destinationForRole(role, nextPath))
  }

  async function signInWithFirebase() {
    setIsSubmittingAuth(true)
    setAuthFeedback(null)

    try {
      const response = await fetch("/api/auth/firebase-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email,
          nextPath,
          password,
          role: selectedRole,
        }),
      })
      const json = (await response.json()) as FirebaseLoginResponse

      if (!response.ok || !json.role || !json.destination) {
        throw new Error(json.error ?? "No pudimos iniciar sesión con Firebase.")
      }

      setLocalSession(json.role, json.userId)
      setAuthFeedback({
        detail: `Perfil ${roleLabels[json.role]} validado${
          json.roleSource === "users" ? " desde Firestore" : ""
        }.`,
        title: "Acceso Firebase verificado",
        tone: "success",
      })
      router.push(json.destination)
    } catch (error) {
      setAuthFeedback({
        detail:
          error instanceof Error
            ? error.message
            : "No pudimos iniciar sesión con Firebase.",
        title: "Revisa el acceso",
        tone: "error",
      })
    } finally {
      setIsSubmittingAuth(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <form
        className="grid gap-4 rounded-xl border border-primary/15 bg-background p-4 shadow-sm shadow-primary/5"
        onSubmit={async (event) => {
          event.preventDefault()
          await signInWithFirebase()
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            <ShieldCheckIcon data-icon="inline-start" />
            Firebase Auth
          </Badge>
          <span className="text-sm font-semibold">
            Acceso con correo y contraseña
          </span>
        </div>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="login-email">Correo</Label>
            <div className="relative">
              <MailIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  resetAuthFeedback()
                }}
                placeholder="correo@parawa.app"
                className="h-10 pl-8"
                autoComplete="email"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="login-password">Contraseña</Label>
            <div className="relative">
              <KeyRoundIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  resetAuthFeedback()
                }}
                placeholder="••••••••"
                className="h-10 pl-8"
                autoComplete="current-password"
              />
            </div>
          </div>
        </div>
        {roles.length > 1 ? (
          <div className="grid gap-2">
            <p className="text-xs font-semibold text-muted-foreground">Rol</p>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant={selectedRole === role ? "default" : "outline"}
                  className="h-9"
                  onClick={() => {
                    setSelectedRole(role)
                    resetAuthFeedback()
                  }}
                >
                  {roleLabels[role]}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
        {authFeedback ? (
          <div
            className={cn(
              "rounded-xl border p-3 text-sm",
              authFeedback.tone === "success"
                ? "border-primary/15 bg-primary/5"
                : "border-destructive/20 bg-destructive/5"
            )}
          >
            <div className="flex items-start gap-2">
              {authFeedback.tone === "success" ? (
                <CheckCircle2Icon className="mt-0.5 size-4 text-primary" />
              ) : (
                <AlertCircleIcon className="mt-0.5 size-4 text-destructive" />
              )}
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-semibold",
                    authFeedback.tone === "success"
                      ? "text-primary"
                      : "text-destructive"
                  )}
                >
                  {authFeedback.title}
                </p>
                <p className="break-anywhere mt-1 text-muted-foreground">
                  {authFeedback.detail}
                </p>
              </div>
            </div>
          </div>
        ) : null}
        <Button
          type="submit"
          disabled={!email.trim() || !password.trim() || isSubmittingAuth}
        >
          {isSubmittingAuth ? "Validando..." : "Entrar con Firebase"}
        </Button>
      </form>

      <div className="grid gap-3 rounded-xl border border-dashed bg-muted/30 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Demo</Badge>
          <p className="text-sm font-semibold">Entrar sin clave</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Usa una identidad Firebase de ejemplo para revisar rutas y datos
          mientras conectamos Auth real.
        </p>
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
      </div>
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
