import { Building2Icon } from "lucide-react"

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
import { getAdminData, type EnterpriseSummary } from "@/lib/parawa-data"

const ENTERPRISE_PAGE_LIMIT = 24
const ENTERPRISE_FILTER_OPTIONS = [
  { label: "Todas", value: "all" },
  { label: "Con propietario", value: "with-owner" },
  { label: "Sin propietario", value: "without-owner" },
  { label: "Con imagen", value: "with-image" },
]

function enterpriseMatchesQuery(enterprise: EnterpriseSummary, query: string) {
  if (!query) return true
  const normalizedQuery = query.toLowerCase()

  return [
    enterprise.id,
    enterprise.name,
    enterprise.description,
    enterprise.ownerId,
    enterprise.ownerName,
    enterprise.updatedAt,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery)
}

export default async function AdminEnterprisesPage({
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
    ENTERPRISE_FILTER_OPTIONS.map((option) => option.value)
  )
  const { enterpriseSummaries } = await getAdminData()
  const filteredEnterprises = enterpriseSummaries.filter((enterprise) => {
    const hasOwner = Boolean(enterprise.ownerId)
    const matchesFilter =
      filter === "all" ||
      (filter === "with-owner" && hasOwner) ||
      (filter === "without-owner" && !hasOwner) ||
      (filter === "with-image" && Boolean(enterprise.imageUrl))

    return matchesFilter && enterpriseMatchesQuery(enterprise, q)
  })
  const {
    end,
    page: currentPage,
    start,
    totalPages,
    visibleItems: visibleEnterprises,
  } = pageItems(filteredEnterprises, page, ENTERPRISE_PAGE_LIMIT)
  const withOwnerCount = enterpriseSummaries.filter(
    (enterprise) => enterprise.ownerId
  ).length
  const withImageCount = enterpriseSummaries.filter(
    (enterprise) => enterprise.imageUrl
  ).length
  const hasActiveFilters = Boolean(q) || filter !== "all"

  return (
    <AdminShell
      active="/admin/enterprises"
      title="Empresas"
      description="Registros enterprise importados desde Firebase"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Total Firebase", enterpriseSummaries.length],
          ["Con propietario", withOwnerCount],
          ["Con imagen", withImageCount],
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
        action="/admin/enterprises"
        filterLabel="Cobertura"
        filterOptions={ENTERPRISE_FILTER_OPTIONS}
        filterValue={filter}
        resultLabel={`${filteredEnterprises.length} de ${enterpriseSummaries.length} empresas`}
        searchPlaceholder="Buscar por empresa, propietario, descripción o ID..."
        searchValue={q}
      />

      {visibleEnterprises.length ? (
        <>
          <div className="grid gap-3 md:hidden">
            {visibleEnterprises.map((enterprise) => (
              <Card key={enterprise.id} size="sm">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Avatar size="lg" className="rounded-xl">
                      <AvatarImage
                        alt=""
                        src={enterprise.imageUrl}
                        className="rounded-xl"
                      />
                      <AvatarFallback className="rounded-xl">
                        <Building2Icon />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="break-anywhere">
                        {enterprise.name}
                      </CardTitle>
                      <p className="break-anywhere text-sm text-muted-foreground">
                        {enterprise.ownerName}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <p className="break-anywhere line-clamp-4 text-muted-foreground">
                    {enterprise.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{enterprise.updatedAt}</Badge>
                    {enterprise.ownerId ? (
                      <Badge variant="secondary">Owner vinculado</Badge>
                    ) : (
                      <Badge variant="outline">Sin owner</Badge>
                    )}
                  </div>
                  <p className="break-anywhere font-mono text-xs text-muted-foreground">
                    {enterprise.id}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Actualizada</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleEnterprises.map((enterprise) => (
                  <TableRow key={enterprise.id}>
                    <TableCell className="min-w-56">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" className="rounded-lg">
                          <AvatarImage
                            alt=""
                            src={enterprise.imageUrl}
                            className="rounded-lg"
                          />
                          <AvatarFallback className="rounded-lg">
                            <Building2Icon />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="break-anywhere font-medium">
                            {enterprise.name}
                          </p>
                          <p className="break-anywhere font-mono text-xs text-muted-foreground">
                            {enterprise.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="break-anywhere whitespace-normal">
                      {enterprise.ownerName}
                    </TableCell>
                    <TableCell className="break-anywhere max-w-md whitespace-normal">
                      <span className="line-clamp-3">
                        {enterprise.description}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {enterprise.updatedAt}
                    </TableCell>
                    <TableCell>
                      {enterprise.ownerId ? (
                        <Badge>Owner vinculado</Badge>
                      ) : (
                        <Badge variant="outline">Sin owner</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <AdminPagination
            basePath="/admin/enterprises"
            end={end}
            page={currentPage}
            pageSize={ENTERPRISE_PAGE_LIMIT}
            params={{ filter, page: String(currentPage), q }}
            start={start}
            totalItems={filteredEnterprises.length}
            totalPages={totalPages}
          />
        </>
      ) : (
        <Empty className="border border-border/70 bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2Icon />
            </EmptyMedia>
            <EmptyTitle>
              {hasActiveFilters
                ? "No hay empresas con esos filtros"
                : "No hay empresas importadas"}
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "Ajusta la búsqueda o limpia los filtros para revisar todos los registros enterprise."
                : "Cuando Firebase devuelva documentos enterprise, aparecerán aquí con propietario, imagen y descripción."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </AdminShell>
  )
}
