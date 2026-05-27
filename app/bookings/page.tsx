import Link from "next/link"

import { PrototypeShell } from "@/components/prototype-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  return (
    <PrototypeShell active="/bookings">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold">Mis reservas</h1>
        <p className="text-sm text-muted-foreground">
          Estado de tus solicitudes (datos de ejemplo).
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{booking.service}</CardTitle>
                  <CardDescription>{booking.providerName}</CardDescription>
                </div>
                <Badge variant={statusVariant(booking.status)}>
                  {statusLabel(booking.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {booking.date} · ${booking.total}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Link
                href={`/providers/${booking.providerId}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Ver proveedor
              </Link>
              <Link
                href={`/messages/${booking.providerId}`}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Chat
              </Link>
              {booking.status === "completed" && (
                <Button size="sm" variant="secondary">
                  Dejar reseña
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </PrototypeShell>
  )
}
