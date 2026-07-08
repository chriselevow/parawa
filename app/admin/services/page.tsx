import { ListChecksIcon } from "lucide-react"

import {
  AdminListControls,
  AdminPagination,
  normalizeAdminListSearchParams,
  pageItems,
} from "@/components/admin-list-controls"
import { AdminShell } from "@/components/admin-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAdminData, type ServiceSummary } from "@/lib/parawa-data"

const SERVICES_PAGE_LIMIT = 36
const SERVICE_FILTER_OPTIONS = [
  { label: "Todos", value: "all" },
  { label: "Paquetes", value: "package" },
  { label: "Con imagen", value: "with-image" },
  { label: "Por distancia", value: "distance" },
  { label: "Sin descripción", value: "missing-description" },
]

function serviceMatchesQuery(service: ServiceSummary, query: string) {
  if (!query) return true
  const normalizedQuery = query.toLowerCase()

  return [
    service.id,
    service.providerId,
    service.providerName,
    service.title,
    service.description,
    service.category,
    service.subCategory,
    service.duration,
    service.pricingMode,
    service.productsPreview,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery)
}

export default async function AdminServicesPage({
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
    SERVICE_FILTER_OPTIONS.map((option) => option.value)
  )
  const { serviceSummaries } = await getAdminData()
  const filteredServices = serviceSummaries.filter((service) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "package" && service.isPackage) ||
      (filter === "with-image" && Boolean(service.imageUrl)) ||
      (filter === "distance" && service.ratePerDistanceUnit) ||
      (filter === "missing-description" &&
        service.description === "Sin descripción publicada.")

    return matchesFilter && serviceMatchesQuery(service, q)
  })
  const {
    end,
    page: currentPage,
    start,
    totalPages,
    visibleItems: visibleServices,
  } = pageItems(filteredServices, page, SERVICES_PAGE_LIMIT)
  const packageCount = serviceSummaries.filter(
    (service) => service.isPackage
  ).length
  const imageCount = serviceSummaries.filter(
    (service) => service.imageUrl
  ).length
  const distanceCount = serviceSummaries.filter(
    (service) => service.ratePerDistanceUnit
  ).length
  const hasActiveFilters = Boolean(q) || filter !== "all"

  return (
    <AdminShell
      active="/admin/services"
      title="Servicios"
      description="Catálogo completo importado desde Firebase"
    >
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Total Firebase", serviceSummaries.length],
          ["Paquetes", packageCount],
          ["Con imagen", imageCount],
          ["Por distancia", distanceCount],
        ].map(([label, value]) => (
          <Card key={label} size="sm">
            <CardHeader>
              <CardTitle className="text-2xl">{value}</CardTitle>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <AdminListControls
        action="/admin/services"
        filterLabel="Tipo"
        filterOptions={SERVICE_FILTER_OPTIONS}
        filterValue={filter}
        resultLabel={`${filteredServices.length} de ${serviceSummaries.length} servicios`}
        searchPlaceholder="Buscar por servicio, proveedor, categoría, producto o ID..."
        searchValue={q}
      />

      {visibleServices.length ? (
        <>
          <div className="grid gap-3 md:hidden">
            {visibleServices.map((service) => (
              <Card key={service.id} size="sm">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Avatar size="lg" className="rounded-xl">
                      <AvatarImage
                        alt=""
                        src={service.imageUrl}
                        className="rounded-xl"
                      />
                      <AvatarFallback className="rounded-xl">
                        <ListChecksIcon />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="break-anywhere">
                        {service.title}
                      </CardTitle>
                      <p className="break-anywhere text-sm text-muted-foreground">
                        {service.providerName}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">${service.price}</Badge>
                    <Badge variant="outline">{service.duration}</Badge>
                    <Badge variant="secondary">{service.category}</Badge>
                    {service.isPackage ? <Badge>Paquete</Badge> : null}
                  </div>
                  <p className="break-anywhere line-clamp-4 text-muted-foreground">
                    {service.description}
                  </p>
                  {service.productsPreview ? (
                    <p className="break-anywhere rounded-lg border bg-muted/35 p-2 text-xs text-muted-foreground">
                      {service.productsPreview}
                    </p>
                  ) : null}
                  <p className="break-anywhere font-mono text-xs text-muted-foreground">
                    {service.id}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="min-w-64">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" className="rounded-lg">
                          <AvatarImage
                            alt=""
                            src={service.imageUrl}
                            className="rounded-lg"
                          />
                          <AvatarFallback className="rounded-lg">
                            <ListChecksIcon />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="break-anywhere font-medium">
                            {service.title}
                          </p>
                          <p className="break-anywhere font-mono text-xs text-muted-foreground">
                            {service.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="break-anywhere whitespace-normal">
                      {service.providerName}
                    </TableCell>
                    <TableCell className="break-anywhere whitespace-normal">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary">{service.category}</Badge>
                        <Badge variant="outline">{service.subCategory}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      ${service.price}
                    </TableCell>
                    <TableCell className="break-anywhere whitespace-normal">
                      {service.duration}
                    </TableCell>
                    <TableCell className="break-anywhere max-w-md whitespace-normal">
                      <div className="grid gap-1">
                        <span className="line-clamp-2">
                          {service.description}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {service.isPackage ? <Badge>Paquete</Badge> : null}
                          {service.productsCount ? (
                            <Badge variant="outline">
                              {service.productsCount} productos
                            </Badge>
                          ) : null}
                          {service.ratePerDistanceUnit ? (
                            <Badge variant="outline">Por distancia</Badge>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <AdminPagination
            basePath="/admin/services"
            end={end}
            page={currentPage}
            pageSize={SERVICES_PAGE_LIMIT}
            params={{ filter, page: String(currentPage), q }}
            start={start}
            totalItems={filteredServices.length}
            totalPages={totalPages}
          />
        </>
      ) : (
        <Empty className="border border-border/70 bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListChecksIcon />
            </EmptyMedia>
            <EmptyTitle>
              {hasActiveFilters
                ? "No hay servicios con esos filtros"
                : "No hay servicios importados"}
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "Ajusta la búsqueda o limpia los filtros para revisar todo el catálogo de servicios."
                : "Cuando Firebase devuelva servicios, aparecerán aquí con precio, duración, proveedor, imágenes y detalles."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </AdminShell>
  )
}
