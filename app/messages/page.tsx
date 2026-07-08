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
import { getBooking, messageThreads, statusLabel } from "@/lib/mock-data"

export default function MessagesPage() {
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
          const booking = getBooking(thread.bookingId)

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
                        <CardTitle className="text-base">
                          {thread.providerName}
                        </CardTitle>
                        {thread.unread ? <Badge>Nuevo</Badge> : null}
                      </div>
                      <CardDescription className="line-clamp-1">
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
                    {thread.service}
                  </Badge>
                  <Badge variant="secondary">
                    {statusLabel(thread.bookingStatus)}
                  </Badge>
                  {booking ? (
                    <span className="text-xs font-medium text-muted-foreground">
                      {`Reserva ${booking.code}`}
                    </span>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </PrototypeShell>
  )
}
