import { UsersIcon } from "lucide-react"

import {
  AdminListControls,
  AdminPagination,
  normalizeAdminListSearchParams,
  pageItems,
} from "@/components/admin-list-controls"
import {
  AdminActionDialog,
  type AdminActionEntity,
} from "@/components/admin-action-dialog"
import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
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
const USER_FILTER_OPTIONS = [
  { label: "Todos", value: "all" },
  { label: "Clientes", value: "client" },
  { label: "Proveedores", value: "provider" },
  { label: "Activos", value: "active" },
  { label: "Suspendidos", value: "suspended" },
]

type AdminUserRow = Awaited<
  ReturnType<typeof getAdminData>
>["adminUsers"][number]

function userMatchesQuery(user: AdminUserRow, query: string) {
  if (!query) return true
  const normalizedQuery = query.toLowerCase()

  return [user.id, user.name, user.email, user.role, user.status, user.joined]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery)
}

function userEntity(user: AdminUserRow): AdminActionEntity {
  return {
    id: user.id,
    title: user.name,
    subtitle: user.email,
    badges: [user.role, user.status],
    details: [
      ["ID", user.id],
      ["Email", user.email],
      ["Rol", user.role],
      ["Estado", user.status],
      ["Registro", user.joined],
    ],
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{
    filter?: string
    page?: string
    q?: string
  }>
}) {
  const params = await searchParams
  const { filter, page, q } = normalizeAdminListSearchParams(
    params,
    USER_FILTER_OPTIONS.map((option) => option.value)
  )
  const { adminUsers } = await getAdminData()
  const filteredUsers = adminUsers.filter((user) => {
    const matchesFilter =
      filter === "all" || user.role === filter || user.status === filter

    return matchesFilter && userMatchesQuery(user, q)
  })
  const {
    end,
    page: currentPage,
    start,
    totalPages,
    visibleItems: visibleUsers,
  } = pageItems(filteredUsers, page, ADMIN_USERS_LIMIT)
  const clientCount = adminUsers.filter((user) => user.role === "client").length
  const providerCount = adminUsers.filter(
    (user) => user.role === "provider"
  ).length
  const hasActiveFilters = Boolean(q) || filter !== "all"

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

      <AdminListControls
        action="/admin/users"
        filterLabel="Rol o estado"
        filterOptions={USER_FILTER_OPTIONS}
        filterValue={filter}
        resultLabel={`${filteredUsers.length} de ${adminUsers.length} usuarios`}
        searchPlaceholder="Buscar por nombre, correo, rol o ID..."
        searchValue={q}
      />

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
                  <AdminActionDialog kind="view" entity={userEntity(user)} />
                  {user.status === "active" ? (
                    <AdminActionDialog
                      kind="suspend"
                      entity={userEntity(user)}
                      triggerVariant="ghost"
                    />
                  ) : (
                    <AdminActionDialog
                      kind="reactivate"
                      entity={userEntity(user)}
                    />
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
                      <div className="flex justify-end gap-2">
                        <AdminActionDialog
                          kind="view"
                          entity={userEntity(user)}
                          triggerVariant="ghost"
                        />
                        {user.status === "active" ? (
                          <AdminActionDialog
                            kind="suspend"
                            entity={userEntity(user)}
                          />
                        ) : (
                          <AdminActionDialog
                            kind="reactivate"
                            entity={userEntity(user)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <AdminPagination
            basePath="/admin/users"
            end={end}
            page={currentPage}
            pageSize={ADMIN_USERS_LIMIT}
            params={{ filter, page: String(currentPage), q }}
            start={start}
            totalItems={filteredUsers.length}
            totalPages={totalPages}
          />
        </>
      ) : (
        <Empty className="border border-border/70 bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>
              {hasActiveFilters
                ? "No hay usuarios con esos filtros"
                : "No hay usuarios importados"}
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "Ajusta la búsqueda o limpia los filtros para volver a todos los usuarios."
                : "Cuando Firebase devuelva usuarios, aparecerán aquí con rol, estado y fecha de registro."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </AdminShell>
  )
}
