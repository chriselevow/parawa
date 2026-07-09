import { ShieldCheckIcon } from "lucide-react"

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
import {
  Card,
  CardContent,
  CardDescription,
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
import { getAdminData } from "@/lib/parawa-data"

const VERIFICATIONS_PAGE_LIMIT = 8
const VERIFICATION_FILTER_OPTIONS = [
  { label: "Todas", value: "all" },
  { label: "Sin servicios", value: "missing-services" },
  { label: "Con documentos", value: "documents" },
]

type VerificationRow = Awaited<
  ReturnType<typeof getAdminData>
>["pendingVerifications"][number]

function verificationMatchesQuery(item: VerificationRow, query: string) {
  if (!query) return true
  const normalizedQuery = query.toLowerCase()

  return [item.id, item.name, item.category, item.submitted, item.documents]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery)
}

function verificationMatchesFilter(item: VerificationRow, filter: string) {
  if (filter === "missing-services") {
    return item.documents.toLowerCase().includes("servicios")
  }

  if (filter === "documents") {
    return !item.documents.toLowerCase().includes("servicios")
  }

  return true
}

function verificationEntity(item: VerificationRow): AdminActionEntity {
  return {
    id: item.id,
    title: item.name,
    subtitle: item.category,
    badges: [item.submitted],
    details: [
      ["ID", item.id],
      ["Categoría", item.category],
      ["Documentos", item.documents],
      ["Enviado", item.submitted],
    ],
  }
}

export default async function AdminVerificationsPage({
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
    VERIFICATION_FILTER_OPTIONS.map((option) => option.value)
  )
  const { pendingVerifications } = await getAdminData()
  const filteredVerifications = pendingVerifications.filter(
    (item) =>
      verificationMatchesFilter(item, filter) &&
      verificationMatchesQuery(item, q)
  )
  const {
    end,
    page: currentPage,
    start,
    totalPages,
    visibleItems: visibleVerifications,
  } = pageItems(filteredVerifications, page, VERIFICATIONS_PAGE_LIMIT)
  const missingServicesCount = pendingVerifications.filter((item) =>
    verificationMatchesFilter(item, "missing-services")
  ).length
  const hasActiveFilters = Boolean(q) || filter !== "all"

  return (
    <AdminShell
      active="/admin/verifications"
      title="Verificaciones"
      description="Cola de proveedores pendientes de aprobación"
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {filteredVerifications.length} de {pendingVerifications.length}
          </Badge>
          <Badge variant="secondary">
            {missingServicesCount} sin servicios
          </Badge>
        </div>

        <AdminListControls
          action="/admin/verifications"
          filterLabel="Estado"
          filterOptions={VERIFICATION_FILTER_OPTIONS}
          filterValue={filter}
          resultLabel={`${filteredVerifications.length} de ${pendingVerifications.length} verificaciones`}
          searchPlaceholder="Buscar por proveedor, categoría o documentos..."
          searchValue={q}
        />

        {visibleVerifications.length ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {visibleVerifications.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="break-anywhere">
                          {item.name}
                        </CardTitle>
                        <CardDescription className="break-anywhere">
                          {item.category}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{item.submitted}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="break-anywhere text-sm text-muted-foreground">
                      Documentos: {item.documents}
                    </p>
                  </CardContent>
                  <CardFooter className="grid gap-2 sm:flex sm:flex-wrap">
                    <AdminActionDialog
                      kind="approve"
                      entity={verificationEntity(item)}
                    />
                    <AdminActionDialog
                      kind="reject"
                      entity={verificationEntity(item)}
                    />
                    <AdminActionDialog
                      kind="docs"
                      entity={verificationEntity(item)}
                      triggerVariant="ghost"
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>
            <AdminPagination
              basePath="/admin/verifications"
              end={end}
              page={currentPage}
              pageSize={VERIFICATIONS_PAGE_LIMIT}
              params={{ filter, page: String(currentPage), q }}
              start={start}
              totalItems={filteredVerifications.length}
              totalPages={totalPages}
            />
          </>
        ) : (
          <Empty className="border border-border/70 bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShieldCheckIcon />
              </EmptyMedia>
              <EmptyTitle>
                {hasActiveFilters
                  ? "No hay verificaciones con esos filtros"
                  : "No hay verificaciones pendientes"}
              </EmptyTitle>
              <EmptyDescription>
                {hasActiveFilters
                  ? "Ajusta la búsqueda o limpia los filtros para volver a toda la cola de verificaciones."
                  : "Los proveedores importados desde Firebase ya no tienen documentos pendientes en esta vista."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </AdminShell>
  )
}
