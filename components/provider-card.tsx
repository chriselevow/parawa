import Link from "next/link"
import { MapPinIcon, StarIcon } from "lucide-react"

import type { Provider } from "@/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { cn } from "@/lib/utils"

export function ProviderCard({ provider }: { provider: Provider }) {
  const initials = provider.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="grid gap-3 min-[420px]:grid-cols-[auto_minmax(0,1fr)]">
          <Avatar className="size-12">
            {provider.imageUrl ? (
              <AvatarImage src={provider.imageUrl} alt="" />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="break-anywhere line-clamp-2">
              {provider.name}
            </CardTitle>
            <CardDescription className="break-anywhere">
              {provider.category}
            </CardDescription>
            <div className="break-anywhere mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <MapPinIcon data-icon="inline-start" />
              {provider.area}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            <StarIcon data-icon="inline-start" />
            {provider.rating} ({provider.reviews})
          </Badge>
          {provider.verified ? (
            <Badge>Verificado</Badge>
          ) : (
            <Badge variant="outline">Nuevo</Badge>
          )}
          <Badge variant="outline">Desde ${provider.priceFrom}</Badge>
        </div>
        <p className="break-anywhere mt-3 line-clamp-3 text-muted-foreground">
          {provider.bio}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {provider.services.slice(0, 3).map((service) => (
            <Badge
              key={service}
              variant="outline"
              className="max-w-full text-left leading-snug whitespace-normal"
            >
              <span className="break-anywhere line-clamp-1">{service}</span>
            </Badge>
          ))}
          {provider.services.length > 3 ? (
            <Badge variant="secondary">+{provider.services.length - 3}</Badge>
          ) : null}
        </div>
      </CardContent>
      <CardFooter>
        <Link
          href={`/providers/${provider.id}`}
          className={cn(buttonVariants(), "w-full")}
        >
          Ver perfil
        </Link>
      </CardFooter>
    </Card>
  )
}
