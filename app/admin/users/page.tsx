import { UsersIcon } from "lucide-react"

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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAdminData } from "@/lib/parawa-data"

const ADMIN_USERS_LIMIT = 60

export default async function AdminUsersPage() {
  const { adminUsers } = await getAdminData()
  const visibleUsers = adminUsers.slice(0, ADMIN_USERS_LIMIT)
  const hiddenCount = Math.max(adminUsers.length - visibleUsers.length, 0)
  const clientCount = adminUsers.filter((user) => user.role === "client").length
  const providerCount = adminUsers.filter(
    (user) => user.role === "provider"
  ).length

  return (
    <AdminShell
      active="/admin/users"
      title="Usuarios"
      description="Clientes y proveedores registrados"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Total Firebase", adminUsers.length],
          ["Clientes", clientCount],
          ["Proveedores", providerCount],
        ].map(([label, value]) => (
          <Card key={label} size="sm">
            <CardHeader>
              <CardTitle className="text-2xl">{value}</CardTitle>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      {visibleUsers.length ? (
        <>
          <div className="grid gap-3 md:hidden">
            {visibleUsers.map((user) => (
              <Card key={user.id} size="sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="break-anywhere">
                        {user.name}
                      </CardTitle>
                      <p className="break-anywhere text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      user.status === "active" ? "secondary" : "destructive"
                    }
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
                {visibleUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="break-anywhere font-medium whitespace-normal">
                      {user.name}
                    </TableCell>
                    <TableCell className="break-anywhere whitespace-normal">
                      {user.email}
                    </TableCell>
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

          {hiddenCount ? (
            <Card size="sm">
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {visibleUsers.length} de {adminUsers.length}
                  usuarios. La siguiente etapa debe agregar búsqueda por nombre,
                  correo, rol y estado.
                </p>
                <Badge variant="outline">{hiddenCount} fuera de vista</Badge>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : (
        <Empty className="border border-border/70 bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>No hay usuarios importados</EmptyTitle>
            <EmptyDescription>
              Cuando Firebase devuelva usuarios, aparecerán aquí con rol, estado
              y fecha de registro.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </AdminShell>
  )
}
