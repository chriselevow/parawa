import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { recentAdminBookings } from "@/lib/admin-mock-data"

export default function AdminBookingsPage() {
  return (
    <AdminShell
      active="/admin/bookings"
      title="Reservas"
      description="Todas las solicitudes y transacciones"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
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
              <TableCell className="text-right">
                <Button size="sm" variant="ghost">
                  Detalle
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminShell>
  )
}
