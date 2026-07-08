import Link from "next/link"
import {
  CalendarDaysIcon,
  CheckCheckIcon,
  MessageCircleIcon,
} from "lucide-react"

import {
  AdminListControls,
  AdminPagination,
  normalizeAdminListSearchParams,
  pageItems,
} from "@/components/admin-list-controls"
import { PrototypeShell } from "@/components/prototype-shell"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
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
import { statusLabel } from "@/lib/mock-data"
import {
  getBookingsForClient,
  getMessageThreadsForClient,
} from "@/lib/parawa-data"
import { getActiveSession } from "@/lib/session"

const MESSAGES_PAGE_LIMIT = 6
const MESSAGE_FILTER_OPTIONS = [
  { label: "Todas", value: "all" },
  { label: "No leídos", value: "unread" },
  { label: "Pendientes", value: "pending" },
  { label: "Confirmadas", value: "accepted" },
  { label: "Completadas", value: "completed" },
  { label: "Canceladas", value: "cancelled" },
]

type ClientBooking = Awaited<ReturnType<typeof getBookingsForClient>>[number]
type ClientThread = Awaited<
  ReturnType<typeof getMessageThreadsForClient>
>[number]

function threadMatchesQuery(
  thread: ClientThread,
  query: string,
  booking?: ClientBooking
) {
  if (!query) return true
  const normalizedQuery = query.toLowerCase()

  return [
    thread.id,
    thread.providerId,
    thread.providerName,
    thread.service,
    thread.serviceNames?.join(" "),
    thread.serviceCount,
    thread.preview,
    thread.bookingId,
    thread.bookingStatus,
    booking?.code,
    booking?.date,
    booking?.shortDate,
    booking?.time,
    booking?.serviceLocation,
    booking?.address,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery)
}

export default async function MessagesPage({
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
    MESSAGE_FILTER_OPTIONS.map((option) => option.value)
  )
  const { userId } = await getActiveSession()
  const [messageThreads, bookings] = await Promise.all([
    getMessageThreadsForClient(userId),
    getBookingsForClient(userId),
  ])
  const bookingById = new Map(bookings.map((booking) => [booking.id, booking]))
  const filteredThreads = messageThreads.filter((thread) => {
    const booking = bookingById.get(thread.bookingId)
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" ? thread.unread : thread.bookingStatus === filter)

    return matchesFilter && threadMatchesQuery(thread, q, booking)
  })
  const {
    end,
    page: currentPage,
    start,
    totalPages,
    visibleItems: visibleThreads,
  } = pageItems(filteredThreads, page, MESSAGES_PAGE_LIMIT)
  const unreadCount = messageThreads.filter((thread) => thread.unread).length
  const activeCount = messageThreads.filter(
    (thread) =>
      thread.bookingStatus === "accepted" || thread.bookingStatus === "pending"
  ).length
  const hasActiveFilters = Boolean(q) || filter !== "all"

  return (
    <PrototypeShell active="/messages">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold">Mensajes</h1>
          <p className="text-sm text-muted-foreground">
            Conversaciones conectadas a tus reservas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <MessageCircleIcon data-icon="inline-start" />
            {filteredThreads.length} de {messageThreads.length}
          </Badge>
          <Badge variant="secondary">{unreadCount} no leídos</Badge>
          <Badge variant="outline">{activeCount} activos</Badge>
        </div>
      </div>

      <AdminListControls
        action="/messages"
        filterLabel="Vista"
        filterOptions={MESSAGE_FILTER_OPTIONS}
        filterValue={filter}
        resultLabel={`${filteredThreads.length} de ${messageThreads.length} conversaciones`}
        searchPlaceholder="Buscar por proveedor, servicio, código o mensaje..."
        searchValue={q}
      />

      <div className="grid gap-3">
        {visibleThreads.map((thread) => {
          const booking = bookingById.get(thread.bookingId)

          return (
            <Link key={thread.id} href={`/messages/${thread.id}`}>
              <Card className="transition-colors hover:border-primary/30 hover:bg-muted/35">
                <CardHeader>
                  <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start">
                    <Avatar className="size-11">
                      <AvatarFallback>
                        {thread.providerName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="break-anywhere text-base">
                          {thread.providerName}
                        </CardTitle>
                        {thread.unread ? <Badge>Nuevo</Badge> : null}
                      </div>
                      <CardDescription className="break-anywhere line-clamp-2">
                        {thread.preview}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground sm:justify-end">
                      <CheckCheckIcon className="size-3.5" />
                      {thread.timestamp}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    <CalendarDaysIcon data-icon="inline-start" />
                    <span className="break-anywhere line-clamp-1">
                      {thread.service}
                    </span>
                  </Badge>
                  {thread.serviceCount && thread.serviceCount > 1 ? (
                    <Badge variant="secondary">
                      {thread.serviceCount} servicios
                    </Badge>
                  ) : null}
                  <Badge variant="secondary">
                    {statusLabel(thread.bookingStatus)}
                  </Badge>
                  {booking ? (
                    <span className="break-anywhere text-xs font-medium text-muted-foreground">
                      {`Reserva ${booking.code}`}
                    </span>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          )
        })}
        {!visibleThreads.length ? (
          <Empty className="border border-border/70 bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircleIcon />
              </EmptyMedia>
              <EmptyTitle>
                {hasActiveFilters
                  ? "No hay conversaciones con esos filtros"
                  : "No hay conversaciones todavía"}
              </EmptyTitle>
              <EmptyDescription>
                {hasActiveFilters
                  ? "Ajusta la búsqueda o limpia los filtros para volver a todas tus conversaciones."
                  : "Cuando esta identidad tenga reservas o consultas, los chats aparecerán aquí con su contexto de servicio."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}
        {visibleThreads.length ? (
          <AdminPagination
            basePath="/messages"
            end={end}
            page={currentPage}
            pageSize={MESSAGES_PAGE_LIMIT}
            params={{ filter, page: String(currentPage), q }}
            start={start}
            totalItems={filteredThreads.length}
            totalPages={totalPages}
          />
        ) : null}
      </div>
    </PrototypeShell>
  )
}
