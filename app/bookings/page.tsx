import Link from "next/link"
import {
  CalendarDaysIcon,
  CreditCardIcon,
  MapPinIcon,
  MessageCircleIcon,
} from "lucide-react"

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
import { buttonVariants } from "@/components/ui/button"
import { bookings, statusLabel } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function statusVariant(status: string) {
  if (status === "accepted") return "default"
  if (status === "pending") return "secondary"
  if (status === "completed") return "outline"
  return "destructive"
}

export default function BookingsPage() {
  const upcomingCount = bookings.filter(
    (booking) => booking.status === "accepted" || booking.status === "pending"
  ).length
  const completedCount = bookings.filter(
    (booking) => booking.status === "completed"
  ).length

  return (
    <PrototypeShell active="/bookings">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold">Mis reservas</h1>
          <p className="text-sm text-muted-foreground">
            Estado de tus solicitudes, pagos y próximos servicios.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full border bg-card px-3 py-1 text-sm font-medium">
            {upcomingCount} activas
          </span>
          <span className="rounded-full border bg-card px-3 py-1 text-sm font-medium">
            {completedCount} completada
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(booking.status)}>
                      {statusLabel(booking.status)}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground">
                      {booking.code}
                    </span>
                  </div>
                  <CardTitle>{booking.service}</CardTitle>
                  <CardDescription>{booking.providerName}</CardDescription>
                </div>
                <p className="font-heading text-xl font-semibold">
                  ${booking.total}
                </p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <span className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
                <CalendarDaysIcon className="size-4 text-primary" />
                {booking.shortDate} · {booking.time}
              </span>
              <span className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
                <MapPinIcon className="size-4 text-primary" />
                {booking.serviceLocation}
              </span>
              <span className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
                <CreditCardIcon className="size-4 text-primary" />
                {booking.paymentStatus === "paid"
                  ? "Pagado"
                  : booking.paymentStatus === "authorized"
                    ? "Autorizado"
                    : "Pendiente"}
              </span>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Link
                href={`/bookings/${booking.id}`}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Ver detalle
              </Link>
              <Link
                href={`/providers/${booking.providerId}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" })
                )}
              >
                Ver proveedor
              </Link>
              <Link
                href={`/messages/${booking.providerId}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-primary/30 bg-primary/5 px-4 text-primary hover:bg-primary/10"
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
      </div>
    </PrototypeShell>
  )
}
