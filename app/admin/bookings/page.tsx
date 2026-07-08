import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
                <Dialog>
                  <DialogTrigger render={<Button size="sm" variant="ghost" />}>
                    Detalle
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Reserva {row.id}</DialogTitle>
                      <DialogDescription>
                        Resumen operativo de la solicitud.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 rounded-xl border bg-muted/30 p-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Cliente</span>
                        <span className="font-medium">{row.client}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Proveedor</span>
                        <span className="font-medium">{row.provider}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Servicio</span>
                        <span className="font-medium">{row.service}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Monto</span>
                        <span className="font-medium">${row.amount}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Estado</span>
                        <Badge variant="outline">{row.status}</Badge>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose render={<Button className="sm:flex-1" />}>
                        Cerrar
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminShell>
  )
}
