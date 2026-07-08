import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPinIcon, MessageCircleIcon, StarIcon } from "lucide-react"

import { BookServiceDialog } from "@/components/book-service-dialog"
import { PrototypeShell } from "@/components/prototype-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { buttonVariants } from "@/components/ui/button"
import { getProvider } from "@/lib/parawa-data"
import { cn } from "@/lib/utils"

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const provider = await getProvider(id)
  if (!provider) notFound()

  const initials = provider.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  return (
    <PrototypeShell active="/discover">
      <Link
        href="/discover"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "self-start"
        )}
      >
        ← Volver
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar className="size-16 shrink-0">
              {provider.imageUrl ? (
                <AvatarImage src={provider.imageUrl} alt="" />
              ) : null}
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <h1 className="break-anywhere font-heading text-2xl leading-snug font-medium">
                {provider.name}
              </h1>
              <CardDescription className="break-anywhere">
                {provider.category}
              </CardDescription>
              <div className="break-anywhere flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <MapPinIcon data-icon="inline-start" />
                {provider.area}
                <Badge variant="secondary">
                  <StarIcon data-icon="inline-start" />
                  {provider.rating} · {provider.reviews} reseñas
                </Badge>
                {provider.verified && <Badge>Verificado</Badge>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="break-anywhere">{provider.bio}</p>
          <Separator />
          <div className="flex flex-col gap-2">
            <h2 className="font-medium">Servicios</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {provider.services.map((service) => (
                <li
                  key={service}
                  className="flex min-w-0 flex-col gap-1 rounded-lg border px-3 py-2 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"
                >
                  <span className="break-anywhere font-medium">{service}</span>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    desde ${provider.priceFrom}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <BookServiceDialog provider={provider} />
            <Link
              href={`/messages/${provider.id}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "min-h-12 flex-1 border-primary/30 bg-primary/5 px-5 text-base font-semibold text-primary hover:bg-primary/10"
              )}
            >
              <MessageCircleIcon data-icon="inline-start" />
              Mensaje
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Reseñas recientes</CardTitle>
          <CardDescription>Contenido de ejemplo</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <p>“Excelente servicio, muy puntual.” — Cliente verificado</p>
          <p>“Recomendada, volvería a reservar.” — Ana M.</p>
        </CardContent>
      </Card>
    </PrototypeShell>
  )
}
