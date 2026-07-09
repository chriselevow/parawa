import Link from "next/link"
import {
  AlertTriangleIcon,
  CalendarIcon,
  DollarSignIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react"

import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buttonVariants } from "@/components/ui/button"
import { getAdminData } from "@/lib/parawa-data"
import { cn } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const { adminStats, recentAdminBookings } = await getAdminData()

  return (
    <AdminShell
      active="/admin"
      title="Dashboard"
      description="Resumen general · prototipo clickeable"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: UsersIcon,
            label: "Usuarios",
            value: adminStats.totalUsers.toLocaleString(),
          },
          {
            icon: TrendingUpIcon,
            label: "Proveedores activos",
            value: String(adminStats.activeProviders),
          },
          {
            icon: CalendarIcon,
            label: "Reservas (semana)",
            value: String(adminStats.bookingsThisWeek),
          },
          {
            icon: DollarSignIcon,
            label: "Ingresos (mes)",
            value: `$${adminStats.revenueMonth.toLocaleString()}`,
          },
        ].map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <stat.icon className="text-primary" />
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon />
              Acciones pendientes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link
              href="/admin/verifications"
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <span className="text-sm">Verificaciones de proveedores</span>
              <Badge>{adminStats.pendingVerifications}</Badge>
            </Link>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="flex items-center gap-2 text-sm">
                <AlertTriangleIcon className="text-amber-600" />
                Disputas abiertas
              </span>
              <Badge variant="destructive">{adminStats.openDisputes}</Badge>
            </div>
            <Link
              href="/admin/verifications"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "self-start"
              )}
            >
              Revisar cola
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atajos</CardTitle>
            <CardDescription>Navegación rápida del admin</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link
              href="/admin/providers"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Proveedores
            </Link>
            <Link
              href="/admin/services"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Servicios
            </Link>
            <Link
              href="/admin/bookings"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Reservas
            </Link>
            <Link
              href="/admin/users"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Usuarios
            </Link>
            <Link
              href="/admin/enterprises"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Empresas
            </Link>
            <Link
              href="/admin/quality"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Calidad
            </Link>
            <Link
              href="/admin/reviews"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Reseñas
            </Link>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Landing
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Reservas recientes</CardTitle>
          <CardDescription>
            Últimas transacciones en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:hidden">
            {recentAdminBookings.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border bg-background p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-muted-foreground">
                      {row.id}
                    </p>
                    <p className="break-anywhere font-medium">{row.service}</p>
                    {row.serviceCount && row.serviceCount > 1 ? (
                      <Badge variant="secondary" className="mt-1 w-fit">
                        {row.serviceCount} servicios
                      </Badge>
                    ) : null}
                  </div>
                  <Badge variant="outline">{row.status}</Badge>
                </div>
                <div className="mt-3 grid gap-1 text-muted-foreground">
                  <p className="break-anywhere">Cliente: {row.client}</p>
                  <p className="break-anywhere">Proveedor: {row.provider}</p>
                  <p className="font-medium text-foreground">${row.amount}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAdminBookings.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">
                      {row.id}
                    </TableCell>
                    <TableCell>{row.client}</TableCell>
                    <TableCell>{row.provider}</TableCell>
                    <TableCell>
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="break-anywhere">{row.service}</span>
                        {row.serviceCount && row.serviceCount > 1 ? (
                          <Badge variant="secondary" className="w-fit">
                            {row.serviceCount} servicios
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>${row.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Link
            href="/admin/bookings"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mt-4"
            )}
          >
            Ver todas →
          </Link>
        </CardContent>
      </Card>
    </AdminShell>
  )
}
