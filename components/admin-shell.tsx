import Link from "next/link"
import {
  Building2Icon,
  CalendarIcon,
  GaugeIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  StarIcon,
  type LucideIcon,
  ShieldCheckIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react"

import { BrandMark } from "@/components/brand-mark"
import { SignOutButton } from "@/components/role-session-actions"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAdminData } from "@/lib/parawa-data"
import { cn } from "@/lib/utils"

const baseNav: Array<{
  href: string
  label: string
  icon: LucideIcon
  badge?: number
}> = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/providers", label: "Proveedores", icon: WrenchIcon },
  { href: "/admin/services", label: "Servicios", icon: ListChecksIcon },
  { href: "/admin/bookings", label: "Reservas", icon: CalendarIcon },
  { href: "/admin/users", label: "Usuarios", icon: UsersIcon },
  { href: "/admin/enterprises", label: "Empresas", icon: Building2Icon },
  { href: "/admin/quality", label: "Calidad", icon: GaugeIcon },
  { href: "/admin/reviews", label: "Reseñas", icon: StarIcon },
  {
    href: "/admin/verifications",
    label: "Verificaciones",
    icon: ShieldCheckIcon,
  },
]

export async function AdminShell({
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
  const { adminStats } = await getAdminData()
  const nav = baseNav.map((item) =>
    item.href === "/admin/verifications"
      ? { ...item, badge: adminStats.pendingVerifications }
      : item
  )

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card/80 shadow-sm shadow-primary/5 md:flex">
        <div className="flex flex-col gap-2 border-b bg-background/70 p-4">
          <BrandMark href="/admin" size="sm" />
          <p className="text-xs text-muted-foreground">
            Operación, reservas y confianza
          </p>
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
                "h-9 justify-start rounded-xl"
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
          <div className="flex flex-col gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-3">
            <span className="text-xs font-semibold text-primary">
              Admin interno
            </span>
            <SignOutButton role="admin" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-4 border-b bg-background/80 px-4 py-4 shadow-sm shadow-primary/5 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-heading text-xl font-semibold">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="w-fit rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary md:hidden">
              Admin interno
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:hidden">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({
                      variant: active === item.href ? "default" : "outline",
                      size: "sm",
                    }),
                    "shrink-0"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <SignOutButton role="admin" />
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  )
}
