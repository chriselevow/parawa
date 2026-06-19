import Link from "next/link"

import { BrandMark } from "@/components/brand-mark"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Inicio" },
  { href: "/discover", label: "Explorar" },
  { href: "/bookings", label: "Reservas" },
  { href: "/provider", label: "Proveedor" },
  { href: "/messages", label: "Mensajes" },
  { href: "/admin", label: "Admin" },
]

export function PrototypeShell({
  children,
  active,
}: {
  children: React.ReactNode
  active?: string
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <BrandMark href="/" size="sm" />
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Entrar
            </Link>
          </div>
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({
                    variant: active === link.href ? "default" : "ghost",
                    size: "sm",
                  })
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6">
        {children}
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        Prototipo clickeable · sin backend · Panamá
      </footer>
    </div>
  )
}
