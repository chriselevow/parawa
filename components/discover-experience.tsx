import Link from "next/link"
import {
  ArrowUpDownIcon,
  ChevronDownIcon,
  FilterIcon,
  SearchIcon,
  SearchXIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react"

import { AdminPagination, pageItems } from "@/components/admin-list-controls"
import { ProviderCard } from "@/components/provider-card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import type { Provider } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const DISCOVER_PAGE_LIMIT = 12
const ALL_CATEGORIES = "all"
const DEFAULT_SORT = "recommended"

const DISCOVER_SORT_OPTIONS = [
  { label: "Recomendados", value: DEFAULT_SORT },
  { label: "Mejor calificados", value: "rating" },
  { label: "Más reseñas", value: "reviews" },
  { label: "Menor precio", value: "price-asc" },
  { label: "Nombre A-Z", value: "name" },
]

type DiscoverSearchParams = {
  filter?: string
  page?: string
  q?: string
  sort?: string
}

function normalizeDiscoverSearchParams(
  params: DiscoverSearchParams | undefined,
  validCategories: string[]
) {
  const q = typeof params?.q === "string" ? params.q.trim() : ""
  const filter =
    typeof params?.filter === "string" &&
    validCategories.includes(params.filter)
      ? params.filter
      : ALL_CATEGORIES
  const sort =
    typeof params?.sort === "string" &&
    DISCOVER_SORT_OPTIONS.some((option) => option.value === params.sort)
      ? params.sort
      : DEFAULT_SORT
  const rawPage = Number(params?.page)
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1

  return { filter, page, q, sort }
}

function discoverHref(
  params: {
    filter: string
    page: string
    q: string
    sort: string
  },
  overrides: Partial<{
    filter: string
    page: string
    q: string
    sort: string
  }> = {}
) {
  const merged = { ...params, ...overrides }
  const next = new URLSearchParams()

  if (merged.q) next.set("q", merged.q)
  if (merged.filter && merged.filter !== ALL_CATEGORIES) {
    next.set("filter", merged.filter)
  }
  if (merged.sort && merged.sort !== DEFAULT_SORT) {
    next.set("sort", merged.sort)
  }
  if (merged.page && merged.page !== "1") next.set("page", merged.page)

  const query = next.toString()
  return query ? `/discover?${query}` : "/discover"
}

function providerMatchesQuery(provider: Provider, query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  return [
    provider.name,
    provider.category,
    ...(provider.categories ?? []),
    provider.area,
    provider.bio,
    ...provider.services,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery)
}

function providerMatchesCategory(provider: Provider, category: string) {
  if (category === ALL_CATEGORIES) return true
  return (
    provider.category === category ||
    Boolean(provider.categories?.includes(category))
  )
}

function sortProviders(providers: Provider[], sort: string) {
  return [...providers].sort((a, b) => {
    if (sort === "rating") {
      return (
        b.rating - a.rating ||
        b.reviews - a.reviews ||
        a.name.localeCompare(b.name, "es")
      )
    }

    if (sort === "reviews") {
      return (
        b.reviews - a.reviews ||
        b.rating - a.rating ||
        a.name.localeCompare(b.name, "es")
      )
    }

    if (sort === "price-asc") {
      return (
        a.priceFrom - b.priceFrom ||
        b.rating - a.rating ||
        a.name.localeCompare(b.name, "es")
      )
    }

    if (sort === "name") {
      return a.name.localeCompare(b.name, "es")
    }

    return (
      Number(b.verified) - Number(a.verified) ||
      b.rating - a.rating ||
      b.reviews - a.reviews ||
      a.priceFrom - b.priceFrom ||
      a.name.localeCompare(b.name, "es")
    )
  })
}

export function DiscoverExperience({
  categories,
  providers,
  searchParams,
}: {
  categories: string[]
  providers: Provider[]
  searchParams?: DiscoverSearchParams
}) {
  const categoryOptions = [
    { label: "Todas", value: ALL_CATEGORIES },
    ...categories
      .filter((category) => category !== "Todos")
      .map((category) => ({ label: category, value: category })),
  ]
  const { filter, page, q, sort } = normalizeDiscoverSearchParams(
    searchParams,
    categoryOptions.map((option) => option.value)
  )
  const selectedCategory =
    categoryOptions.find((option) => option.value === filter)?.label ?? "Todas"
  const sortedProviders = sortProviders(
    providers.filter(
      (provider) =>
        providerMatchesCategory(provider, filter) &&
        providerMatchesQuery(provider, q)
    ),
    sort
  )
  const {
    end,
    page: currentPage,
    start,
    totalPages,
    visibleItems: visibleProviders,
  } = pageItems(sortedProviders, page, DISCOVER_PAGE_LIMIT)
  const verifiedCount = providers.filter((provider) => provider.verified).length
  const activeCategoryCount = Math.max(categoryOptions.length - 1, 0)
  const hasActiveFilters =
    Boolean(q) || filter !== ALL_CATEGORIES || sort !== DEFAULT_SORT
  const currentParams = {
    filter,
    page: String(currentPage),
    q,
    sort,
  }

  const selectClassName =
    "h-10 w-full appearance-none rounded-lg border border-input bg-background pr-8 pl-8 text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold">
            Explorar servicios
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Busca por proveedor, servicio, categoría o zona. El catálogo se
            pagina para soportar todos los proveedores importados desde
            Firebase.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <SparklesIcon data-icon="inline-start" />
            {sortedProviders.length} de {providers.length}
          </Badge>
          <Badge variant="secondary">
            <ShieldCheckIcon data-icon="inline-start" />
            {verifiedCount} verificados
          </Badge>
          <Badge variant="outline">{activeCategoryCount} categorías</Badge>
        </div>
      </div>

      <Card size="sm" className="border-primary/10">
        <CardContent className="grid gap-3">
          <form
            action="/discover"
            className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
          >
            <input type="hidden" name="page" value="1" />
            <label className="grid min-w-0 gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Buscar
              </span>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Nombre, servicio o zona..."
                  className="h-10 pl-8"
                />
              </div>
            </label>
            <label className="grid min-w-0 gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Categoría
              </span>
              <div className="relative">
                <FilterIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  name="filter"
                  defaultValue={filter}
                  className={cn(selectClassName, "min-w-40")}
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </label>
            <label className="grid min-w-0 gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Orden
              </span>
              <div className="relative">
                <ArrowUpDownIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  name="sort"
                  defaultValue={sort}
                  className={cn(selectClassName, "min-w-48")}
                >
                  {DISCOVER_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </label>
            <div className="grid gap-2 sm:flex sm:items-end">
              <Button type="submit" className="h-10">
                Aplicar
              </Button>
              {hasActiveFilters ? (
                <Link
                  href="/discover"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-10 w-full sm:w-auto"
                  )}
                >
                  Limpiar
                </Link>
              ) : null}
            </div>
          </form>
          <div className="flex max-w-full flex-wrap gap-2 pb-1">
            {categoryOptions.map((option) => (
              <Link
                key={option.value}
                href={discoverHref(currentParams, {
                  filter: option.value,
                  page: "1",
                })}
                className={cn(
                  buttonVariants({
                    variant: filter === option.value ? "default" : "outline",
                    size: "sm",
                  }),
                  "shrink-0 rounded-full"
                )}
              >
                {option.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">
              {sortedProviders.length} resultado
              {sortedProviders.length === 1 ? "" : "s"}
            </Badge>
            <Badge variant="secondary">Categoría: {selectedCategory}</Badge>
            {sort !== DEFAULT_SORT ? (
              <Badge variant="outline">
                Orden:{" "}
                {
                  DISCOVER_SORT_OPTIONS.find((option) => option.value === sort)
                    ?.label
                }
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {visibleProviders.length ? (
        <>
          <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
          <AdminPagination
            basePath="/discover"
            end={end}
            page={currentPage}
            pageSize={DISCOVER_PAGE_LIMIT}
            params={currentParams}
            start={start}
            totalItems={sortedProviders.length}
            totalPages={totalPages}
          />
        </>
      ) : (
        <Empty className="border border-border/70 bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>No encontramos proveedores</EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "Prueba otra categoría, una zona más amplia o limpia los filtros para volver al catálogo completo."
                : "Cuando Firebase tenga proveedores publicados, aparecerán aquí con categoría, ubicación, reseñas y precio inicial."}
            </EmptyDescription>
          </EmptyHeader>
          {hasActiveFilters ? (
            <Link
              href="/discover"
              className={cn(buttonVariants({ variant: "outline" }), "mt-1")}
            >
              Ver todos
            </Link>
          ) : null}
        </Empty>
      )}

      <Link
        href="/"
        className={cn(
          "self-start text-sm font-medium text-muted-foreground hover:text-foreground"
        )}
      >
        Volver al inicio
      </Link>
    </>
  )
}
