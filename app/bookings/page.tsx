import Link from "next/link"
import {
  CalendarDaysIcon,
  CreditCardIcon,
  MapPinIcon,
  MessageCircleIcon,
} from "lucide-react"

import {
  AdminListControls,
  AdminPagination,
  normalizeAdminListSearchParams,
  pageItems,
} from "@/components/admin-list-controls"
import { PrototypeShell } from "@/components/prototype-shell"
import { ReviewDialog } from "@/components/review-dialog"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
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
import { buttonVariants } from "@/components/ui/button"
import { statusLabel } from "@/lib/mock-data"
import { getBookingsForClient } from "@/lib/parawa-data"
import { getActiveSession } from "@/lib/session"
import { cn } from "@/lib/utils"

const BOOKINGS_PAGE_LIMIT = 12
const BOOKING_FILTER_OPTIONS = [
  { label: "Todas", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "Confirmadas", value: "accepted" },
  { label: "Completadas", value: "completed" },
  { label: "Canceladas", value: "cancelled" },
]

function statusVariant(status: string) {
  if (status === "accepted") return "default"
  if (status === "pending") return "secondary"
  if (status === "completed") return "outline"
  return "destructive"
}

type ClientBooking = Awaited<ReturnType<typeof getBookingsForClient>>[number]

function bookingMatchesQuery(booking: ClientBooking, query: string) {
  if (!query) return true
  const normalizedQuery = query.toLowerCase()

  return [
    booking.id,
    booking.code,
    booking.providerName,
    booking.service,
    booking.date,
    booking.shortDate,
    booking.time,
    booking.serviceLocation,
    booking.address,
    booking.paymentMethod,
    booking.paymentStatus,
    booking.status,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery)
}

export default async function BookingsPage({
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
  const { userId } = await getActiveSession()
  const bookings = await getBookingsForClient(userId)
  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter = filter === "all" || booking.status === filter
    return matchesFilter && bookingMatchesQuery(booking, q)
  })
  const {
    end,
    page: currentPage,
    start,
    totalPages,
    visibleItems: visibleBookings,
  } = pageItems(filteredBookings, page, BOOKINGS_PAGE_LIMIT)
  const upcomingCount = bookings.filter(
    (booking) => booking.status === "accepted" || booking.status === "pending"
  ).length
  const completedCount = bookings.filter(
    (booking) => booking.status === "completed"
  ).length
  const hasActiveFilters = Boolean(q) || filter !== "all"

  return (
    <PrototypeShell active="/bookings">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold">Mis reservas</h1>
          <p className="text-sm text-muted-foreground">
            Estado de tus solicitudes, pagos y próximos servicios.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {userId ? (
            <span className="break-anywhere rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
              Sesión demo filtrada
            </span>
          ) : null}
          <span className="rounded-full border bg-card px-3 py-1 text-sm font-medium">
            {upcomingCount} activas
          </span>
          <span className="rounded-full border bg-card px-3 py-1 text-sm font-medium">
            {completedCount} completadas
          </span>
          <span className="rounded-full border bg-card px-3 py-1 text-sm font-medium text-muted-foreground">
            {filteredBookings.length} de {bookings.length}
          </span>
        </div>
      </div>

      <AdminListControls
        action="/bookings"
        filterLabel="Estado"
        filterOptions={BOOKING_FILTER_OPTIONS}
        filterValue={filter}
        resultLabel={`${filteredBookings.length} de ${bookings.length} reservas`}
        searchPlaceholder="Buscar por proveedor, servicio, ubicación o código..."
        searchValue={q}
      />

      <div className="flex flex-col gap-4">
        {visibleBookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(booking.status)}>
                      {statusLabel(booking.status)}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground">
                      {booking.code}
                    </span>
                  </div>
                  <CardTitle className="break-anywhere">
                    {booking.service}
                  </CardTitle>
                  <CardDescription className="break-anywhere">
                    {booking.providerName}
                  </CardDescription>
                </div>
                <p className="shrink-0 font-heading text-xl font-semibold">
                  ${booking.total}
                </p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <span className="flex min-w-0 items-center gap-2 rounded-xl border bg-background px-3 py-2">
                <CalendarDaysIcon className="size-4 shrink-0 text-primary" />
                <span className="break-anywhere">
                  {booking.shortDate} · {booking.time}
                </span>
              </span>
              <span className="flex min-w-0 items-center gap-2 rounded-xl border bg-background px-3 py-2">
                <MapPinIcon className="size-4 shrink-0 text-primary" />
                <span className="break-anywhere">
                  {booking.serviceLocation}
                </span>
              </span>
              <span className="flex min-w-0 items-center gap-2 rounded-xl border bg-background px-3 py-2">
                <CreditCardIcon className="size-4 shrink-0 text-primary" />
                <span className="break-anywhere">
                  {booking.paymentStatus === "paid"
                    ? "Pagado"
                    : booking.paymentStatus === "authorized"
                      ? "Autorizado"
                      : "Pendiente"}
                </span>
              </span>
            </CardContent>
            <CardFooter className="grid gap-2 sm:flex sm:flex-wrap">
              <Link
                href={`/bookings/${booking.id}`}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "w-full sm:w-auto"
                )}
              >
                Ver detalle
              </Link>
              <Link
                href={`/providers/${booking.providerId}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full sm:w-auto"
                )}
              >
                Ver proveedor
              </Link>
              <Link
                href={`/messages/${booking.providerId}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full border-primary/30 bg-primary/5 px-4 text-primary hover:bg-primary/10 sm:w-auto"
                )}
              >
                <MessageCircleIcon data-icon="inline-start" />
                Chat
              </Link>
              {booking.status === "completed" && (
                <ReviewDialog
                  providerName={booking.providerName}
                  service={booking.service}
                />
              )}
            </CardFooter>
          </Card>
        ))}
        {!visibleBookings.length ? (
          <Empty className="border border-border/70 bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarDaysIcon />
              </EmptyMedia>
              <EmptyTitle>
                {hasActiveFilters
                  ? "No hay reservas con esos filtros"
                  : "No hay reservas todavía"}
              </EmptyTitle>
              <EmptyDescription>
                {hasActiveFilters
                  ? "Ajusta la búsqueda o limpia los filtros para volver a todas tus reservas."
                  : "Cuando el usuario tenga solicitudes, aparecerán aquí con estado, pago, proveedor y acceso al chat."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}
        {visibleBookings.length ? (
          <AdminPagination
            basePath="/bookings"
            end={end}
            page={currentPage}
            pageSize={BOOKINGS_PAGE_LIMIT}
            params={{ filter, page: String(currentPage), q }}
            start={start}
            totalItems={filteredBookings.length}
            totalPages={totalPages}
          />
        ) : null}
      </div>
    </PrototypeShell>
  )
}
