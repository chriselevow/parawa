import Link from "next/link"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  SearchIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type FilterOption = {
  label: string
  value: string
}

export type AdminListParams = {
  page?: string
  q?: string
  filter?: string
}

function paramsFor(
  path: string,
  params: AdminListParams,
  overrides: AdminListParams
) {
  const next = new URLSearchParams()
  const merged = { ...params, ...overrides }

  if (merged.q) next.set("q", merged.q)
  if (merged.filter && merged.filter !== "all")
    next.set("filter", merged.filter)
  if (merged.page && merged.page !== "1") next.set("page", merged.page)

  const query = next.toString()
  return query ? `${path}?${query}` : path
}

export function normalizeAdminListSearchParams(
  params:
    | {
        filter?: string
        page?: string
        q?: string
      }
    | undefined,
  validFilters: string[]
) {
  const q = typeof params?.q === "string" ? params.q.trim() : ""
  const filter =
    typeof params?.filter === "string" && validFilters.includes(params.filter)
      ? params.filter
      : "all"
  const rawPage = Number(params?.page)
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1

  return { filter, page, q }
}

export function pageItems<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(Math.ceil(items.length / pageSize), 1)
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const startIndex = (safePage - 1) * pageSize
  const visibleItems = items.slice(startIndex, startIndex + pageSize)

  return {
    end: items.length ? startIndex + visibleItems.length : 0,
    page: safePage,
    start: items.length ? startIndex + 1 : 0,
    totalPages,
    visibleItems,
  }
}

export function AdminListControls({
  action,
  filterLabel,
  filterOptions,
  filterValue,
  resultLabel,
  searchPlaceholder,
  searchValue,
}: {
  action: string
  filterLabel: string
  filterOptions: FilterOption[]
  filterValue: string
  resultLabel: string
  searchPlaceholder: string
  searchValue: string
}) {
  const hasFilters = Boolean(searchValue) || filterValue !== "all"

  return (
    <Card size="sm">
      <CardContent className="grid gap-3">
        <form
          action={action}
          className="grid gap-3 lg:grid-cols-[1fr_auto_auto]"
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
                defaultValue={searchValue}
                placeholder={searchPlaceholder}
                className="h-10 pl-8"
              />
            </div>
          </label>
          <label className="grid min-w-0 gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">
              {filterLabel}
            </span>
            <div className="relative">
              <FilterIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <select
                name="filter"
                defaultValue={filterValue}
                className="h-10 w-full min-w-44 appearance-none rounded-lg border border-input bg-background pr-8 pl-8 text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <div className="grid gap-2 sm:flex sm:items-end">
            <Button type="submit" className="h-10">
              Aplicar
            </Button>
            {hasFilters ? (
              <Link
                href={action}
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
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{resultLabel}</Badge>
          {hasFilters ? (
            <Badge variant="secondary">Filtros activos</Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminPagination({
  basePath,
  end,
  page,
  pageSize,
  params,
  start,
  totalItems,
  totalPages,
}: {
  basePath: string
  end: number
  page: number
  pageSize: number
  params: AdminListParams
  start: number
  totalItems: number
  totalPages: number
}) {
  const previousHref = paramsFor(basePath, params, {
    page: String(Math.max(page - 1, 1)),
  })
  const nextHref = paramsFor(basePath, params, {
    page: String(Math.min(page + 1, totalPages)),
  })
  const hasPrevious = page > 1
  const hasNext = page < totalPages

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {`Mostrando ${start}-${end} de ${totalItems}. Página ${page} de ${totalPages}. ${pageSize} por página.`}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link
            href={previousHref}
            aria-disabled={!hasPrevious}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              !hasPrevious && "pointer-events-none opacity-50"
            )}
          >
            <ChevronLeftIcon data-icon="inline-start" />
            Anterior
          </Link>
          <Link
            href={nextHref}
            aria-disabled={!hasNext}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              !hasNext && "pointer-events-none opacity-50"
            )}
          >
            Siguiente
            <ChevronRightIcon data-icon="inline-end" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
