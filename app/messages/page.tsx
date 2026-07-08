import Link from "next/link"
import {
  CalendarDaysIcon,
  CheckCheckIcon,
  MessageCircleIcon,
} from "lucide-react"

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

export default async function MessagesPage() {
  const { userId } = await getActiveSession()
  const [messageThreads, bookings] = await Promise.all([
    getMessageThreadsForClient(userId),
    getBookingsForClient(userId),
  ])
  const bookingById = new Map(bookings.map((booking) => [booking.id, booking]))

  return (
    <PrototypeShell active="/messages">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold">Mensajes</h1>
          <p className="text-sm text-muted-foreground">
            Conversaciones conectadas a tus reservas.
          </p>
        </div>
        <Badge variant="outline">
          <MessageCircleIcon data-icon="inline-start" />
          {messageThreads.length} conversaciones
        </Badge>
      </div>

      <div className="grid gap-3">
        {messageThreads.map((thread) => {
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
        {!messageThreads.length ? (
          <Empty className="border border-border/70 bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircleIcon />
              </EmptyMedia>
              <EmptyTitle>No hay conversaciones todavía</EmptyTitle>
              <EmptyDescription>
                Cuando esta identidad tenga reservas o consultas, los chats
                aparecerán aquí con su contexto de servicio.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}
      </div>
    </PrototypeShell>
  )
}
