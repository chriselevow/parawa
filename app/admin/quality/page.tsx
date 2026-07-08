import { GaugeIcon } from "lucide-react"

import {
  AdminListControls,
  AdminPagination,
  normalizeAdminListSearchParams,
  pageItems,
} from "@/components/admin-list-controls"
import { AdminShell } from "@/components/admin-shell"
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
import {
  getAdminData,
  type PunctualityEvaluationSummary,
  type PunctualityValue,
} from "@/lib/parawa-data"

const QUALITY_PAGE_LIMIT = 40
const QUALITY_FILTER_OPTIONS = [
  { label: "Todas", value: "all" },
  { label: "Puntuales", value: "yes" },
  { label: "Tarde", value: "no" },
  { label: "Sin respuesta", value: "unknown" },
]

function punctualityCopy(value: PunctualityValue) {
  if (value === "yes") return "Puntual"
  if (value === "no") return "Tarde"
  return "Sin respuesta"
}

function punctualityVariant(value: PunctualityValue) {
  if (value === "yes") return "default"
  if (value === "no") return "destructive"
  return "outline"
}

function evaluationMatchesQuery(
  evaluation: PunctualityEvaluationSummary,
  query: string
) {
  if (!query) return true
  const normalizedQuery = query.toLowerCase()

  return [
    evaluation.id,
    evaluation.providerId,
    evaluation.providerName,
    evaluation.customerId,
    evaluation.customerName,
    evaluation.bookingId,
    evaluation.service,
    evaluation.serviceNames.join(" "),
    evaluation.createdAt,
    evaluation.wasPunctual,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery)
}

export default async function AdminQualityPage({
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
    QUALITY_FILTER_OPTIONS.map((option) => option.value)
  )
  const { punctualityEvaluations, providerQualitySummaries } =
    await getAdminData()
  const filteredEvaluations = punctualityEvaluations.filter((evaluation) => {
    const matchesFilter = filter === "all" || evaluation.wasPunctual === filter

    return matchesFilter && evaluationMatchesQuery(evaluation, q)
  })
  const {
    end,
    page: currentPage,
    start,
    totalPages,
    visibleItems: visibleEvaluations,
  } = pageItems(filteredEvaluations, page, QUALITY_PAGE_LIMIT)
  const onTimeCount = punctualityEvaluations.filter(
    (evaluation) => evaluation.wasPunctual === "yes"
  ).length
  const lateCount = punctualityEvaluations.filter(
    (evaluation) => evaluation.wasPunctual === "no"
  ).length
  const unknownCount = punctualityEvaluations.length - onTimeCount - lateCount
  const onTimeRate = punctualityEvaluations.length
    ? Math.round((onTimeCount / punctualityEvaluations.length) * 100)
    : 0
  const hasActiveFilters = Boolean(q) || filter !== "all"

  return (
    <AdminShell
      active="/admin/quality"
      title="Calidad"
      description="Evaluaciones de puntualidad importadas desde Firebase"
    >
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Evaluaciones", punctualityEvaluations.length],
          ["Puntualidad", `${onTimeRate}%`],
          ["Tarde", lateCount],
          ["Sin respuesta", unknownCount],
        ].map(([label, value]) => (
          <Card key={label} size="sm">
            <CardHeader>
              <CardTitle className="text-2xl">{value}</CardTitle>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      {providerQualitySummaries.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Proveedores con más señales</CardTitle>
            <p className="text-sm text-muted-foreground">
              Resumen agregado para ubicar patrones sin abrir cada evaluación.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {providerQualitySummaries.slice(0, 6).map((summary) => {
              const providerName =
                summary.recentEvaluations[0]?.providerName ?? summary.providerId

              return (
                <div
                  key={summary.providerId}
                  className="rounded-xl border bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-anywhere font-medium">
                        {providerName}
                      </p>
                      <p className="break-anywhere font-mono text-xs text-muted-foreground">
                        {summary.providerId}
                      </p>
                    </div>
                    <Badge>{summary.onTimeRate}%</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded-lg border p-2">
                      <p className="font-semibold">{summary.onTime}</p>
                      <p className="text-xs text-muted-foreground">Puntual</p>
                    </div>
                    <div className="rounded-lg border p-2">
                      <p className="font-semibold">{summary.late}</p>
                      <p className="text-xs text-muted-foreground">Tarde</p>
                    </div>
                    <div className="rounded-lg border p-2">
                      <p className="font-semibold">{summary.total}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      ) : null}

      <AdminListControls
        action="/admin/quality"
        filterLabel="Resultado"
        filterOptions={QUALITY_FILTER_OPTIONS}
        filterValue={filter}
        resultLabel={`${filteredEvaluations.length} de ${punctualityEvaluations.length} evaluaciones`}
        searchPlaceholder="Buscar por proveedor, cliente, servicio, booking o ID..."
        searchValue={q}
      />

      {visibleEvaluations.length ? (
        <>
          <div className="grid gap-3 md:hidden">
            {visibleEvaluations.map((evaluation) => (
              <Card key={evaluation.id} size="sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="break-anywhere">
                        {evaluation.providerName}
                      </CardTitle>
                      <p className="break-anywhere text-sm text-muted-foreground">
                        Cliente: {evaluation.customerName}
                      </p>
                    </div>
                    <Badge variant={punctualityVariant(evaluation.wasPunctual)}>
                      {punctualityCopy(evaluation.wasPunctual)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <div>
                    <p className="break-anywhere font-medium">
                      {evaluation.service}
                    </p>
                    {evaluation.serviceCount > 1 ? (
                      <Badge variant="secondary" className="mt-1 w-fit">
                        {evaluation.serviceCount} servicios
                      </Badge>
                    ) : null}
                  </div>
                  <div className="grid gap-1 text-muted-foreground">
                    <p className="break-anywhere">
                      Booking: {evaluation.bookingId || "Sin booking"}
                    </p>
                    <p>{evaluation.createdAt}</p>
                    <p className="break-anywhere font-mono text-xs">
                      {evaluation.id}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleEvaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell className="break-anywhere font-medium whitespace-normal">
                      {evaluation.providerName}
                    </TableCell>
                    <TableCell className="break-anywhere whitespace-normal">
                      {evaluation.customerName}
                    </TableCell>
                    <TableCell className="break-anywhere whitespace-normal">
                      <div className="flex min-w-0 flex-col gap-1">
                        <span>{evaluation.service}</span>
                        {evaluation.serviceCount > 1 ? (
                          <Badge variant="secondary" className="w-fit">
                            {evaluation.serviceCount} servicios
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="break-anywhere font-mono text-xs whitespace-normal">
                      {evaluation.bookingId || "Sin booking"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {evaluation.createdAt}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={punctualityVariant(evaluation.wasPunctual)}
                      >
                        {punctualityCopy(evaluation.wasPunctual)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <AdminPagination
            basePath="/admin/quality"
            end={end}
            page={currentPage}
            pageSize={QUALITY_PAGE_LIMIT}
            params={{ filter, page: String(currentPage), q }}
            start={start}
            totalItems={filteredEvaluations.length}
            totalPages={totalPages}
          />
        </>
      ) : (
        <Empty className="border border-border/70 bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GaugeIcon />
            </EmptyMedia>
            <EmptyTitle>
              {hasActiveFilters
                ? "No hay evaluaciones con esos filtros"
                : "No hay evaluaciones importadas"}
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "Ajusta la búsqueda o limpia los filtros para revisar todas las evaluaciones de puntualidad."
                : "Cuando Firebase devuelva punctuality_evalution, aparecerá aquí con proveedor, cliente, servicio y booking."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </AdminShell>
  )
}
