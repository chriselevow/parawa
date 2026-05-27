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
import { adminUsers } from "@/lib/admin-mock-data"

export default function AdminUsersPage() {
  return (
    <AdminShell
      active="/admin/users"
      title="Usuarios"
      description="Clientes y proveedores registrados"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Registro</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adminUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{user.role}</Badge>
              </TableCell>
              <TableCell>{user.joined}</TableCell>
              <TableCell>
                <Badge
                  variant={user.status === "active" ? "secondary" : "destructive"}
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost">
                  Ver
                </Button>
                {user.status === "active" ? (
                  <Button size="sm" variant="outline">
                    Suspender
                  </Button>
                ) : (
                  <Button size="sm">Reactivar</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminShell>
  )
}
