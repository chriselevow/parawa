import Link from "next/link"

import { BrandMark } from "@/components/brand-mark"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/discover", label: "Servicios" },
  { href: "#como-funciona", label: "Cómo funciona" },
  {
    href: "/login?role=provider&next=%2Fprovider",
    label: "Soy proveedor",
  },
]

export function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/90 shadow-sm shadow-primary/5 backdrop-blur supports-backdrop-filter:bg-background/75">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <BrandMark href="/" />
            <Link
              href="/discover"
              className={cn(buttonVariants({ size: "sm" }), "sm:hidden")}
            >
              Descargar app
            </Link>
          </div>
          <nav className="hidden items-center justify-end gap-1 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Entrar
            </Link>
            <Link
              href="/discover"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Descargar app
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-muted/20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <BrandMark size="sm" />
            <p className="text-sm text-muted-foreground">
              Mercado digital de servicios locales · Panamá
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link
              href="/discover"
              className="text-muted-foreground hover:text-foreground"
            >
              Clientes
            </Link>
            <Link
              href="/login?role=provider&next=%2Fprovider"
              className="text-muted-foreground hover:text-foreground"
            >
              Negocios
            </Link>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground"
            >
              Soporte
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
