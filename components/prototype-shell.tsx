import { BrandMark } from "@/components/brand-mark"
import { PrototypeShellNav } from "@/components/prototype-shell-nav"

const clientLinks = [
  { href: "/discover", label: "Servicios" },
  { href: "/bookings", label: "Reservas" },
  { href: "/messages", label: "Mensajes" },
]

const providerLinks = [
  { href: "/provider", label: "Panel" },
  { href: "/provider#solicitudes", label: "Solicitudes" },
  { href: "/provider#perfil", label: "Perfil" },
]

export function PrototypeShell({
  children,
  active,
}: {
  children: React.ReactNode
  active?: string
}) {
  const isProvider = active === "/provider"
  const links = isProvider ? providerLinks : active ? clientLinks : []
  const role = isProvider ? "provider" : active ? "client" : null
  const workspaceLabel = isProvider
    ? "Portal proveedor"
    : active
      ? "Cliente"
      : null

  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/90 shadow-sm shadow-primary/5 backdrop-blur supports-backdrop-filter:bg-background/75">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-3 py-2 sm:px-4 sm:py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <BrandMark href={isProvider ? "/provider" : "/"} size="sm" />
            {workspaceLabel ? (
              <span className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">
                {workspaceLabel}
              </span>
            ) : null}
          </div>
          <PrototypeShellNav
            links={links}
            role={role}
            activeFallback={active}
          />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
        {children}
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        Prototipo clickeable · sin backend · Panamá
      </footer>
    </div>
  )
}
