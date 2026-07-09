import Link from "next/link"
import { WrenchIcon } from "lucide-react"

import {
  AdminListControls,
  AdminPagination,
  normalizeAdminListSearchParams,
  pageItems,
} from "@/components/admin-list-controls"
import {
  AdminActionDialog,
  type AdminActionEntity,
} from "@/components/admin-action-dialog"
import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getProviders } from "@/lib/parawa-data"
import { cn } from "@/lib/utils"

const ADMIN_PROVIDERS_LIMIT = 40
const PROVIDER_FILTER_OPTIONS = [
  { label: "Todos los estados", value: "all" },
  { label: "Verificados", value: "verified" },
  { label: "Pendientes", value: "pending" },
]

type ProviderRow = Awaited<ReturnType<typeof getProviders>>[number]

function providerMatchesQuery(provider: ProviderRow, query: string) {
  if (!query) return true
  const normalizedQuery = query.toLowerCase()

  return [
    provider.id,
    provider.name,
    provider.category,
    provider.area,
    provider.bio,
    ...(provider.categories ?? []),
    ...provider.services,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery)
}

function providerEntity(provider: ProviderRow): AdminActionEntity {
  return {
    id: provider.id,
    title: provider.name,
    subtitle: `${provider.category} · ${provider.area}`,
    badges: [
      provider.verified ? "Verificado" : "Pendiente",
      `${provider.rating} rating`,
    ],
    details: [
      ["ID", provider.id],
      ["Categoría", provider.category],
      ["Zona", provider.area],
      ["Reseñas", provider.reviews],
      ["Precio desde", `$${provider.priceFrom}`],
      ["Servicios", provider.services.length],
    ],
  }
}

export default async function AdminProvidersPage({
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
    PROVIDER_FILTER_OPTIONS.map((option) => option.value)
  )
  const providers = await getProviders()
  const filteredProviders = providers.filter((provider) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "verified" && provider.verified) ||
      (filter === "pending" && !provider.verified)

    return matchesFilter && providerMatchesQuery(provider, q)
  })
  const {
    end,
    page: currentPage,
    start,
    totalPages,
    visibleItems: visibleProviders,
  } = pageItems(filteredProviders, page, ADMIN_PROVIDERS_LIMIT)
  const verifiedCount = providers.filter((provider) => provider.verified).length
  const pendingCount = providers.length - verifiedCount
  const hasActiveFilters = Boolean(q) || filter !== "all"

  return (
    <AdminShell
      active="/admin/providers"
      title="Proveedores"
      description="Gestión de perfiles y servicios publicados"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Total Firebase", providers.length],
          ["Verificados", verifiedCount],
          ["Pendientes", pendingCount],
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
        action="/admin/providers"
        filterLabel="Estado"
        filterOptions={PROVIDER_FILTER_OPTIONS}
        filterValue={filter}
        resultLabel={`${filteredProviders.length} de ${providers.length} proveedores`}
        searchPlaceholder="Buscar por nombre, categoría, zona o servicio..."
        searchValue={q}
      />

      {visibleProviders.length ? (
        <>
          <div className="grid gap-3 md:hidden">
            {visibleProviders.map((p) => (
              <Card key={p.id} size="sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="break-anywhere">{p.name}</CardTitle>
                      <p className="break-anywhere text-sm text-muted-foreground">
                        {p.category} · {p.area}
                      </p>
                    </div>
                    {p.verified ? (
                      <Badge>Verificado</Badge>
                    ) : (
                      <Badge variant="secondary">Pendiente</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {p.rating} ({p.reviews})
                    </Badge>
                    <Badge variant="outline">Desde ${p.priceFrom}</Badge>
                  </div>
                  <p className="break-anywhere line-clamp-3 text-muted-foreground">
                    {p.bio}
                  </p>
                </CardContent>
                <CardFooter className="grid gap-2">
                  <Link
                    href={`/providers/${p.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" })
                    )}
                  >
                    Ver perfil
                  </Link>
                  {!p.verified ? (
                    <AdminActionDialog
                      kind="approve"
                      entity={providerEntity(p)}
                    />
                  ) : null}
                  <AdminActionDialog
                    kind="suspend"
                    entity={providerEntity(p)}
                    triggerVariant="ghost"
                  />
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Zona</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleProviders.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="break-anywhere font-medium whitespace-normal">
                      {p.name}
                    </TableCell>
                    <TableCell className="break-anywhere whitespace-normal">
                      {p.category}
                    </TableCell>
                    <TableCell className="break-anywhere whitespace-normal">
                      {p.area}
                    </TableCell>
                    <TableCell>
                      {p.rating} ({p.reviews})
                    </TableCell>
                    <TableCell>
                      {p.verified ? (
                        <Badge>Verificado</Badge>
                      ) : (
                        <Badge variant="secondary">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/providers/${p.id}`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" })
                          )}
                        >
                          Ver
                        </Link>
                        {!p.verified ? (
                          <AdminActionDialog
                            kind="approve"
                            entity={providerEntity(p)}
                          />
                        ) : null}
                        <AdminActionDialog
                          kind="suspend"
                          entity={providerEntity(p)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <AdminPagination
            basePath="/admin/providers"
            end={end}
            page={currentPage}
            pageSize={ADMIN_PROVIDERS_LIMIT}
            params={{ filter, page: String(currentPage), q }}
            start={start}
            totalItems={filteredProviders.length}
            totalPages={totalPages}
          />
        </>
      ) : (
        <Empty className="border border-border/70 bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WrenchIcon />
            </EmptyMedia>
            <EmptyTitle>
              {hasActiveFilters
                ? "No hay proveedores con esos filtros"
                : "No hay proveedores importados"}
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "Ajusta la búsqueda o limpia los filtros para volver a todos los proveedores."
                : "Cuando Firebase devuelva usuarios proveedores, aparecerán aquí con estado de verificación y acciones operativas."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </AdminShell>
  )
}
