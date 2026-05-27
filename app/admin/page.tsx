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
import { adminStats, recentAdminBookings } from "@/lib/admin-mock-data"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AdminDashboardPage() {
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
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "self-start")}
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
            <Link href="/admin/providers" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Proveedores
            </Link>
            <Link href="/admin/bookings" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Reservas
            </Link>
            <Link href="/admin/users" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Usuarios
            </Link>
            <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Landing
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Reservas recientes</CardTitle>
          <CardDescription>Últimas transacciones en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
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
                  <TableCell className="font-mono text-xs">{row.id}</TableCell>
                  <TableCell>{row.client}</TableCell>
                  <TableCell>{row.provider}</TableCell>
                  <TableCell>{row.service}</TableCell>
                  <TableCell>${row.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Link
            href="/admin/bookings"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-4")}
          >
            Ver todas →
          </Link>
        </CardContent>
      </Card>
    </AdminShell>
  )
}
