import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
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
import { getAdminData } from "@/lib/parawa-data"

export default async function AdminUsersPage() {
  const { adminUsers } = await getAdminData()

  return (
    <AdminShell
      active="/admin/users"
      title="Usuarios"
      description="Clientes y proveedores registrados"
    >
      <div className="grid gap-3 md:hidden">
        {adminUsers.map((user) => (
          <Card key={user.id} size="sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="break-anywhere">{user.name}</CardTitle>
                  <p className="break-anywhere text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <Badge variant="outline">{user.role}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge
                variant={user.status === "active" ? "secondary" : "destructive"}
              >
                {user.status}
              </Badge>
              <Badge variant="outline">Registro {user.joined}</Badge>
            </CardContent>
            <CardFooter className="grid gap-2">
              <Button size="sm" variant="outline">
                Ver
              </Button>
              {user.status === "active" ? (
                <Button size="sm" variant="ghost">
                  Suspender
                </Button>
              ) : (
                <Button size="sm">Reactivar</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="hidden md:block">
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
                    variant={
                      user.status === "active" ? "secondary" : "destructive"
                    }
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
      </div>
    </AdminShell>
  )
}
