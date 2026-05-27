import Link from "next/link"
import {
  CalendarIcon,
  HomeIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { adminStats } from "@/lib/admin-mock-data"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/providers", label: "Proveedores", icon: WrenchIcon },
  { href: "/admin/bookings", label: "Reservas", icon: CalendarIcon },
  { href: "/admin/users", label: "Usuarios", icon: UsersIcon },
  {
    href: "/admin/verifications",
    label: "Verificaciones",
    icon: ShieldCheckIcon,
    badge: adminStats.pendingVerifications,
  },
]

export function AdminShell({
  children,
  active,
  title,
  description,
}: {
  children: React.ReactNode
  active: string
  title: string
  description?: string
}) {
  return (
    <div className="flex min-h-svh bg-background">
      <aside className="hidden w-56 shrink-0 flex-col border-r bg-muted/20 md:flex">
        <div className="flex flex-col gap-1 border-b p-4">
          <Link href="/" className="font-heading text-sm font-semibold">
            Parawa
          </Link>
          <p className="text-xs text-muted-foreground">Panel administración</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({
                  variant: active === item.href ? "secondary" : "ghost",
                  size: "sm",
                }),
                "justify-start"
              )}
            >
              <item.icon data-icon="inline-start" />
              {item.label}
              {item.badge ? (
                <Badge variant="default" className="ml-auto">
                  {item.badge}
                </Badge>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3">
          <Link
            href="/discover"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
          >
            <HomeIcon data-icon="inline-start" />
            Ver app
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="font-heading text-xl font-semibold">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 md:hidden">
            {nav.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({
                    variant: active === item.href ? "default" : "outline",
                    size: "sm",
                  })
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  )
}
