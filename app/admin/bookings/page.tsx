import { CalendarDaysIcon } from "lucide-react"

import {
  AdminListControls,
  AdminPagination,
  normalizeAdminListSearchParams,
  pageItems,
} from "@/components/admin-list-controls"
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

const ADMIN_BOOKINGS_LIMIT = 40
const BOOKING_FILTER_OPTIONS = [
  { label: "Todos los estados", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "Confirmadas", value: "accepted" },
  { label: "Completadas", value: "completed" },
  { label: "Canceladas", value: "cancelled" },
]

type AdminBookingRow = Awaited<
  ReturnType<typeof getAdminData>
>["adminBookings"][number]

function rowMatchesQuery(row: AdminBookingRow, query: string) {
  if (!query) return true
  const normalizedQuery = query.toLowerCase()

  return [
    row.id,
    row.client,
    row.provider,
    row.service,
    row.serviceNames?.join(" "),
    row.serviceCount,
    row.status,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery)
}

function BookingDetailDialog({
  row,
  triggerClassName,
  triggerVariant = "ghost",
}: {
  row: AdminBookingRow
  triggerClassName?: string
  triggerVariant?: "ghost" | "outline"
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant={triggerVariant}
            className={triggerClassName}
          />
        }
      >
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
          {[
            ["Cliente", row.client],
            ["Proveedor", row.provider],
            ["Servicio", row.service],
            ["Monto", `$${row.amount}`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="grid gap-1 min-[420px]:grid-cols-[auto_minmax(0,1fr)] min-[420px]:items-start"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="break-anywhere font-medium min-[420px]:text-right">
                {value}
              </span>
            </div>
          ))}
          {row.serviceNames && row.serviceNames.length > 1 ? (
            <div className="grid gap-2 rounded-lg border bg-background/80 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground">Servicios</span>
                <Badge variant="secondary">
                  {row.serviceCount ?? row.serviceNames.length} servicios
                </Badge>
              </div>
              <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                {row.serviceNames.map((service) => (
                  <Badge key={service} variant="outline">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-muted-foreground">Estado</span>
            <Badge variant="outline">{row.status}</Badge>
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button className="w-full sm:flex-1" />}>
            Cerrar
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default async function AdminBookingsPage({
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
    BOOKING_FILTER_OPTIONS.map((option) => option.value)
  )
  const { adminBookings } = await getAdminData()
  const filteredRows = adminBookings.filter((row) => {
    const matchesFilter = filter === "all" || row.status === filter
    return matchesFilter && rowMatchesQuery(row, q)
  })
  const {
    end,
    page: currentPage,
    start,
    totalPages,
    visibleItems: visibleRows,
  } = pageItems(filteredRows, page, ADMIN_BOOKINGS_LIMIT)
  const activeCount = adminBookings.filter(
    (row) => row.status === "accepted" || row.status === "pending"
  ).length
  const completedCount = adminBookings.filter(
    (row) => row.status === "completed"
  ).length
  const hasActiveFilters = Boolean(q) || filter !== "all"

  return (
    <AdminShell
      active="/admin/bookings"
      title="Reservas"
      description="Todas las solicitudes y transacciones"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Total Firebase", adminBookings.length],
          ["Activas", activeCount],
          ["Completadas", completedCount],
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
        action="/admin/bookings"
        filterLabel="Estado"
        filterOptions={BOOKING_FILTER_OPTIONS}
        filterValue={filter}
        resultLabel={`${filteredRows.length} de ${adminBookings.length} reservas`}
        searchPlaceholder="Buscar por cliente, proveedor, servicio o ID..."
        searchValue={q}
      />

      {visibleRows.length ? (
        <>
          <div className="grid gap-3 md:hidden">
            {visibleRows.map((row) => (
              <Card key={row.id} size="sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-muted-foreground">
                        {row.id}
                      </p>
                      <CardTitle className="break-anywhere">
                        {row.service}
                      </CardTitle>
                      {row.serviceCount && row.serviceCount > 1 ? (
                        <Badge variant="secondary">
                          {row.serviceCount} servicios
                        </Badge>
                      ) : null}
                    </div>
                    <Badge variant="outline">{row.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2">
                    <span className="text-muted-foreground">Cliente</span>
                    <span className="break-anywhere font-medium">
                      {row.client}
                    </span>
                  </div>
                  <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2">
                    <span className="text-muted-foreground">Proveedor</span>
                    <span className="break-anywhere font-medium">
                      {row.provider}
                    </span>
                  </div>
                  <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2">
                    <span className="text-muted-foreground">Monto</span>
                    <span className="font-medium">${row.amount}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <BookingDetailDialog
                    row={row}
                    triggerVariant="outline"
                    triggerClassName="w-full"
                  />
                </CardFooter>
              </Card>
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
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">
                      {row.id}
                    </TableCell>
                    <TableCell className="break-anywhere whitespace-normal">
                      {row.client}
                    </TableCell>
                    <TableCell className="break-anywhere whitespace-normal">
                      {row.provider}
                    </TableCell>
                    <TableCell className="break-anywhere whitespace-normal">
                      <div className="flex min-w-0 flex-col gap-1">
                        <span>{row.service}</span>
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
                    <TableCell className="text-right">
                      <BookingDetailDialog row={row} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <AdminPagination
            basePath="/admin/bookings"
            end={end}
            page={currentPage}
            pageSize={ADMIN_BOOKINGS_LIMIT}
            params={{ filter, page: String(currentPage), q }}
            start={start}
            totalItems={filteredRows.length}
            totalPages={totalPages}
          />
        </>
      ) : (
        <Empty className="border border-border/70 bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarDaysIcon />
            </EmptyMedia>
            <EmptyTitle>
              {hasActiveFilters
                ? "No hay reservas con esos filtros"
                : "No hay reservas importadas"}
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "Ajusta la búsqueda o limpia los filtros para volver a todas las reservas."
                : "Cuando Firebase devuelva reservas, aparecerán aquí con resumen, estado y detalle operativo."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </AdminShell>
  )
}
