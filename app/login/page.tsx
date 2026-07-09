import Link from "next/link"

import { PrototypeShell } from "@/components/prototype-shell"
import { RoleLoginActions } from "@/components/role-session-actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { getSessionIdentityOptions } from "@/lib/parawa-data"
import { normalizeRole, roleLabels, safeNextPath } from "@/lib/roles"
import { cn } from "@/lib/utils"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{
    next?: string
    role?: string
  }>
}) {
  const params = await searchParams
  const intent = normalizeRole(params?.role)
  const nextPath = safeNextPath(params?.next)
  const identities = await getSessionIdentityOptions()
  const title = intent
    ? `Entrar como ${roleLabels[intent].toLowerCase()}`
    : "Entrar a Parawa"
  const description =
    intent === "admin"
      ? "Acceso interno del equipo de operaciones."
      : intent === "provider"
        ? "Accede al portal para gestionar solicitudes, agenda y perfil."
        : "Accede como cliente para reservar, chatear y revisar tus solicitudes."

  return (
    <PrototypeShell>
      <Card className="mx-auto w-full max-w-xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <RoleLoginActions
            identities={identities}
            intent={intent}
            nextPath={nextPath}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-center text-xs text-muted-foreground">
            ¿Quieres reservar?{" "}
            <Link
              href="/login?role=client&next=%2Fdiscover"
              className="text-primary underline-offset-4 hover:underline"
            >
              Entrar como cliente
            </Link>
          </p>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Volver al inicio
          </Link>
        </CardFooter>
      </Card>
    </PrototypeShell>
  )
}
