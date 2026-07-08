import Link from "next/link"
import { notFound } from "next/navigation"
import {
  CalendarDaysIcon,
  CreditCardIcon,
  MapPinIcon,
  MessageCircleIcon,
  ReceiptTextIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { BookingStatusTimeline } from "@/components/booking-status-timeline"
import { PrototypeShell } from "@/components/prototype-shell"
import { ReviewDialog } from "@/components/review-dialog"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getBooking, statusLabel } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function statusVariant(status: string) {
  if (status === "accepted") return "default"
  if (status === "pending") return "secondary"
  if (status === "completed") return "outline"
  return "destructive"
}

function paymentLabel(paymentStatus: string) {
  if (paymentStatus === "authorized") return "Autorizado"
  if (paymentStatus === "paid") return "Pagado"
  if (paymentStatus === "refunded") return "Reembolsado"
  return "Pendiente"
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const booking = getBooking(id)
  if (!booking) notFound()

  return (
    <PrototypeShell active="/bookings">
      <Link
        href="/bookings"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "self-start"
        )}
      >
        Volver a reservas
      </Link>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge variant={statusVariant(booking.status)}>
                    {statusLabel(booking.status)}
                  </Badge>
                  <CardTitle className="mt-3 text-2xl">
                    {booking.service}
                  </CardTitle>
                  <CardDescription>
                    {booking.providerName} · {booking.code}
                  </CardDescription>
                </div>
                <div className="rounded-xl border border-primary/10 bg-secondary/45 p-3 text-sm">
                  <p className="font-heading text-xl font-semibold">
                    ${booking.total}
                  </p>
                  <p className="text-muted-foreground">
                    {booking.duration} · {booking.serviceLocation}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-background p-4">
                <CalendarDaysIcon className="text-primary" />
                <p className="mt-3 text-sm font-medium">Fecha y hora</p>
                <p className="text-sm text-muted-foreground">
                  {booking.shortDate} · {booking.time}
                </p>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <MapPinIcon className="text-primary" />
                <p className="mt-3 text-sm font-medium">Ubicación</p>
                <p className="text-sm text-muted-foreground">
                  {booking.address}
                </p>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <CreditCardIcon className="text-primary" />
                <p className="mt-3 text-sm font-medium">Pago</p>
                <p className="text-sm text-muted-foreground">
                  {paymentLabel(booking.paymentStatus)} ·{" "}
                  {booking.paymentMethod}
                </p>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <ShieldCheckIcon className="text-primary" />
                <p className="mt-3 text-sm font-medium">Protección</p>
                <p className="text-sm text-muted-foreground">
                  Pago retenido hasta cerrar el servicio.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex-wrap gap-2">
              <Link
                href={`/messages/${booking.providerId}`}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                <MessageCircleIcon data-icon="inline-start" />
                Abrir chat
              </Link>
              <Link
                href={`/providers/${booking.providerId}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" })
                )}
              >
                Ver proveedor
              </Link>
              {booking.status === "completed" ? (
                <ReviewDialog
                  providerName={booking.providerName}
                  service={booking.service}
                />
              ) : null}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline de la reserva</CardTitle>
              <CardDescription>
                Estado visible para cliente y proveedor.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingStatusTimeline items={booking.timeline} />
            </CardContent>
          </Card>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>Detalles operativos</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              {[
                ["Cliente", booking.clientName],
                ["Proveedor", booking.providerName],
                ["Creada", booking.createdAt],
                ["Método", booking.serviceLocation],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-right font-medium">{value}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${booking.total}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">${booking.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ReceiptTextIcon className="text-primary" />
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{booking.notes}</p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </PrototypeShell>
  )
}
