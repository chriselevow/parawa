import Link from "next/link"
import { MapPinIcon, StarIcon } from "lucide-react"

import type { Provider } from "@/lib/mock-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar className="size-12">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle>{provider.name}</CardTitle>
            <CardDescription>{provider.category}</CardDescription>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
        <p className="mt-3 line-clamp-2 text-muted-foreground">{provider.bio}</p>
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
