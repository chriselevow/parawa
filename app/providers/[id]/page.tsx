import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  MapPinIcon,
  MessageCircleIcon,
  SearchIcon,
  SearchXIcon,
  StarIcon,
} from "lucide-react"

import { pageItems } from "@/components/admin-list-controls"
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  getProvider,
  getServicesForProvider,
  type ServiceSummary,
} from "@/lib/parawa-data"
import { cn } from "@/lib/utils"

const PROVIDER_SERVICES_PAGE_LIMIT = 8

type ProviderServiceDisplay = {
  id: string
  title: string
  description: string
  category: string
  subCategory: string
  price: number
  duration: string
  imageUrl?: string
  isPackage: boolean
  productsCount: number
  productsPreview: string
}

function serviceMatchesQuery(service: ProviderServiceDisplay, query: string) {
  if (!query) return true
  const normalizedQuery = query.toLowerCase()

  return [
    service.id,
    service.title,
    service.description,
    service.category,
    service.subCategory,
    service.duration,
    service.productsPreview,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery)
}

function providerServiceHref(
  providerPath: string,
  params: { page: string; q: string },
  overrides: Partial<{ page: string; q: string }> = {}
) {
  const merged = { ...params, ...overrides }
  const next = new URLSearchParams()

  if (merged.q) next.set("q", merged.q)
  if (merged.page && merged.page !== "1") next.set("page", merged.page)

  const query = next.toString()
  return query ? `${providerPath}?${query}` : providerPath
}

export default async function ProviderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    page?: string
    q?: string
  }>
}) {
  const { id } = await params
  const search = await searchParams
  const provider = await getProvider(id)
  if (!provider) notFound()
  const firebaseServices = await getServicesForProvider(provider.id)
  const services: ProviderServiceDisplay[] = firebaseServices.length
    ? firebaseServices.map((service: ServiceSummary) => ({
        id: service.id,
        title: service.title,
        description: service.description,
        category: service.category,
        subCategory: service.subCategory,
        price: service.price,
        duration: service.duration,
        imageUrl: service.imageUrl,
        isPackage: service.isPackage,
        productsCount: service.productsCount,
        productsPreview: service.productsPreview,
      }))
    : provider.services.map((service) => ({
        id: service,
        title: service,
        description: provider.bio,
        category: provider.category,
        subCategory: provider.category,
        price: provider.priceFrom,
        duration: "Por confirmar",
        isPackage: false,
        productsCount: 0,
        productsPreview: "",
      }))
  const q = typeof search?.q === "string" ? search.q.trim() : ""
  const rawPage = Number(search?.page)
  const requestedPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const filteredServices = services.filter((service) =>
    serviceMatchesQuery(service, q)
  )
  const {
    end,
    page: currentPage,
    start,
    totalPages,
    visibleItems: visibleServices,
  } = pageItems(filteredServices, requestedPage, PROVIDER_SERVICES_PAGE_LIMIT)
  const hasActiveServiceSearch = Boolean(q)
  const providerPath = `/providers/${provider.id}`
  const servicePaginationParams = { page: String(currentPage), q }
  const previousServicesHref = providerServiceHref(
    providerPath,
    servicePaginationParams,
    {
      page: String(Math.max(currentPage - 1, 1)),
    }
  )
  const nextServicesHref = providerServiceHref(
    providerPath,
    servicePaginationParams,
    {
      page: String(Math.min(currentPage + 1, totalPages)),
    }
  )

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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h2 className="font-medium">Servicios</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredServices.length} de {services.length} servicios
                  disponibles.
                </p>
              </div>
              <Badge variant="outline">
                {PROVIDER_SERVICES_PAGE_LIMIT} por página
              </Badge>
            </div>
            <div className="grid gap-3 rounded-xl border border-primary/10 bg-muted/25 p-3">
              <form
                action={providerPath}
                className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
              >
                <input type="hidden" name="page" value="1" />
                <label className="grid min-w-0 gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Buscar servicios
                  </span>
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      name="q"
                      defaultValue={q}
                      placeholder="Buscar por servicio..."
                      className="h-10 bg-background pl-8"
                    />
                  </div>
                </label>
                <div className="grid gap-2 sm:flex sm:items-end">
                  <Button type="submit" className="h-10">
                    Buscar
                  </Button>
                  {hasActiveServiceSearch ? (
                    <Link
                      href={providerPath}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-10 w-full bg-background sm:w-auto"
                      )}
                    >
                      Limpiar
                    </Link>
                  ) : null}
                </div>
              </form>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {filteredServices.length} resultado
                  {filteredServices.length === 1 ? "" : "s"}
                </Badge>
                {firebaseServices.length ? (
                  <Badge variant="secondary">Detalles Firebase</Badge>
                ) : null}
                {hasActiveServiceSearch ? (
                  <Badge variant="secondary">Búsqueda activa</Badge>
                ) : null}
              </div>
            </div>
            {visibleServices.length ? (
              <>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {visibleServices.map((service) => (
                    <li
                      key={service.id}
                      className="grid min-w-0 gap-3 rounded-xl border bg-background p-3"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="size-14 rounded-xl">
                          {service.imageUrl ? (
                            <AvatarImage
                              alt=""
                              src={service.imageUrl}
                              className="rounded-xl"
                            />
                          ) : null}
                          <AvatarFallback className="rounded-xl">
                            <ImageIcon className="size-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <span className="break-anywhere font-medium">
                              {service.title}
                            </span>
                            <Badge variant="outline">${service.price}</Badge>
                          </div>
                          <p className="break-anywhere mt-1 line-clamp-3 text-sm text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary">{service.category}</Badge>
                        <Badge variant="outline">{service.duration}</Badge>
                        {service.isPackage ? <Badge>Paquete</Badge> : null}
                        {service.productsCount ? (
                          <Badge variant="outline">
                            {service.productsCount} productos
                          </Badge>
                        ) : null}
                      </div>
                      {service.productsPreview ? (
                        <p className="break-anywhere rounded-lg border bg-muted/35 p-2 text-xs text-muted-foreground">
                          {service.productsPreview}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/25 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {`Mostrando ${start}-${end} de ${filteredServices.length}. Página ${currentPage} de ${totalPages}.`}
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <Link
                      href={previousServicesHref}
                      aria-disabled={currentPage <= 1}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "bg-background",
                        currentPage <= 1 && "pointer-events-none opacity-50"
                      )}
                    >
                      <ChevronLeftIcon data-icon="inline-start" />
                      Anterior
                    </Link>
                    <Link
                      href={nextServicesHref}
                      aria-disabled={currentPage >= totalPages}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "bg-background",
                        currentPage >= totalPages &&
                          "pointer-events-none opacity-50"
                      )}
                    >
                      Siguiente
                      <ChevronRightIcon data-icon="inline-end" />
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <Empty className="border border-border/70 bg-card">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchXIcon />
                  </EmptyMedia>
                  <EmptyTitle>No hay servicios con esa búsqueda</EmptyTitle>
                  <EmptyDescription>
                    Limpia la búsqueda para volver al catálogo completo de este
                    proveedor.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <BookServiceDialog provider={provider} services={services} />
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
