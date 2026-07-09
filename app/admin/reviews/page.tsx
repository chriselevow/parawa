import { MessageSquareTextIcon, StarIcon } from "lucide-react"

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
  type PunctualityValue,
  type ReviewSummary,
} from "@/lib/parawa-data"

const REVIEWS_PAGE_LIMIT = 40
const REVIEW_FILTER_OPTIONS = [
  { label: "Todas", value: "all" },
  { label: "5 estrellas", value: "five-star" },
  { label: "Baja puntuación", value: "low-score" },
  { label: "Con comentario", value: "commented" },
  { label: "Anónimas", value: "anonymous" },
  { label: "Puntuales", value: "punctual" },
  { label: "Tarde", value: "late" },
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

function scoreVariant(score: number) {
  if (score >= 4.5) return "default"
  if (score < 3) return "destructive"
  return "outline"
}

function reviewMatchesQuery(review: ReviewSummary, query: string) {
  if (!query) return true
  const normalizedQuery = query.toLowerCase()

  return [
    review.id,
    review.providerId,
    review.providerName,
    review.customerId,
    review.customerName,
    review.bookingId,
    review.service,
    review.serviceNames.join(" "),
    review.score,
    review.comment,
    review.createdAt,
    review.wasPunctual,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery)
}

function hasPublishedComment(review: ReviewSummary) {
  return review.comment !== "Sin comentario publicado."
}

export default async function AdminReviewsPage({
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
    REVIEW_FILTER_OPTIONS.map((option) => option.value)
  )
  const { reviewSummaries } = await getAdminData()
  const filteredReviews = reviewSummaries.filter((review) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "five-star" && review.score >= 5) ||
      (filter === "low-score" && review.score < 3) ||
      (filter === "commented" && hasPublishedComment(review)) ||
      (filter === "anonymous" && review.anon) ||
      (filter === "punctual" && review.wasPunctual === "yes") ||
      (filter === "late" && review.wasPunctual === "no")

    return matchesFilter && reviewMatchesQuery(review, q)
  })
  const {
    end,
    page: currentPage,
    start,
    totalPages,
    visibleItems: visibleReviews,
  } = pageItems(filteredReviews, page, REVIEWS_PAGE_LIMIT)
  const averageScore = reviewSummaries.length
    ? Math.round(
        (reviewSummaries.reduce((sum, review) => sum + review.score, 0) /
          reviewSummaries.length) *
          10
      ) / 10
    : 0
  const commentedCount = reviewSummaries.filter(hasPublishedComment).length
  const anonymousCount = reviewSummaries.filter((review) => review.anon).length
  const lateCount = reviewSummaries.filter(
    (review) => review.wasPunctual === "no"
  ).length
  const hasActiveFilters = Boolean(q) || filter !== "all"

  return (
    <AdminShell
      active="/admin/reviews"
      title="Reseñas"
      description="Comentarios, puntuaciones y señales de puntualidad importadas desde Firebase"
    >
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Total Firebase", reviewSummaries.length],
          ["Promedio", averageScore ? `${averageScore}/5` : "0/5"],
          ["Con comentario", commentedCount],
          ["Tarde", lateCount],
        ].map(([label, value]) => (
          <Card key={label} size="sm">
            <CardHeader>
              <CardTitle className="text-2xl">{value}</CardTitle>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de confianza</CardTitle>
          <p className="text-sm text-muted-foreground">
            Señales visibles para soporte antes de conectar moderación o
            respuestas del proveedor.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-background p-3">
            <p className="text-2xl font-semibold">{commentedCount}</p>
            <p className="text-sm text-muted-foreground">
              Reseñas con texto visible
            </p>
          </div>
          <div className="rounded-xl border bg-background p-3">
            <p className="text-2xl font-semibold">{anonymousCount}</p>
            <p className="text-sm text-muted-foreground">Clientes anónimos</p>
          </div>
          <div className="rounded-xl border bg-background p-3">
            <p className="text-2xl font-semibold">{lateCount}</p>
            <p className="text-sm text-muted-foreground">Marcadas como tarde</p>
          </div>
        </CardContent>
      </Card>

      <AdminListControls
        action="/admin/reviews"
        filterLabel="Tipo"
        filterOptions={REVIEW_FILTER_OPTIONS}
        filterValue={filter}
        resultLabel={`${filteredReviews.length} de ${reviewSummaries.length} reseñas`}
        searchPlaceholder="Buscar por proveedor, cliente, servicio, comentario, booking o ID..."
        searchValue={q}
      />

      {visibleReviews.length ? (
        <>
          <div className="grid gap-3 md:hidden">
            {visibleReviews.map((review) => (
              <Card key={review.id} size="sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="break-anywhere">
                        {review.providerName}
                      </CardTitle>
                      <p className="break-anywhere text-sm text-muted-foreground">
                        Cliente:{" "}
                        {review.anon ? "Cliente anónimo" : review.customerName}
                      </p>
                    </div>
                    <Badge variant={scoreVariant(review.score)}>
                      <StarIcon data-icon="inline-start" />
                      {review.score}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <p className="break-anywhere line-clamp-4 text-muted-foreground">
                    {review.comment}
                  </p>
                  <div>
                    <p className="break-anywhere font-medium">
                      {review.service}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {review.serviceCount > 1 ? (
                        <Badge variant="secondary">
                          {review.serviceCount} servicios
                        </Badge>
                      ) : null}
                      <Badge variant={punctualityVariant(review.wasPunctual)}>
                        {punctualityCopy(review.wasPunctual)}
                      </Badge>
                      {review.anon ? (
                        <Badge variant="outline">Anónima</Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid gap-1 text-muted-foreground">
                    <p className="break-anywhere">
                      Booking: {review.bookingId || "Sin booking"}
                    </p>
                    <p>{review.createdAt}</p>
                    <p className="break-anywhere font-mono text-xs">
                      {review.id}
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
                  <TableHead>Comentario</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Señales</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="break-anywhere font-medium whitespace-normal">
                      {review.providerName}
                    </TableCell>
                    <TableCell className="break-anywhere whitespace-normal">
                      {review.anon ? "Cliente anónimo" : review.customerName}
                    </TableCell>
                    <TableCell className="break-anywhere whitespace-normal">
                      <div className="flex min-w-0 flex-col gap-1">
                        <span>{review.service}</span>
                        {review.serviceCount > 1 ? (
                          <Badge variant="secondary" className="w-fit">
                            {review.serviceCount} servicios
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="break-anywhere max-w-md whitespace-normal">
                      <span className="line-clamp-3">{review.comment}</span>
                    </TableCell>
                    <TableCell className="break-anywhere font-mono text-xs whitespace-normal">
                      {review.bookingId || "Sin booking"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {review.createdAt}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={scoreVariant(review.score)}>
                          <StarIcon data-icon="inline-start" />
                          {review.score}
                        </Badge>
                        <Badge variant={punctualityVariant(review.wasPunctual)}>
                          {punctualityCopy(review.wasPunctual)}
                        </Badge>
                        {review.anon ? (
                          <Badge variant="outline">Anónima</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <AdminPagination
            basePath="/admin/reviews"
            end={end}
            page={currentPage}
            pageSize={REVIEWS_PAGE_LIMIT}
            params={{ filter, page: String(currentPage), q }}
            start={start}
            totalItems={filteredReviews.length}
            totalPages={totalPages}
          />
        </>
      ) : (
        <Empty className="border border-border/70 bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquareTextIcon />
            </EmptyMedia>
            <EmptyTitle>
              {hasActiveFilters
                ? "No hay reseñas con esos filtros"
                : "No hay reseñas importadas"}
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "Ajusta la búsqueda o limpia los filtros para revisar todas las reseñas Firebase."
                : "Cuando Firebase devuelva reviews, aparecerán aquí con proveedor, cliente, comentario, puntuación y booking."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </AdminShell>
  )
}
