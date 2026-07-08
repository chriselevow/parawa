"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { SearchXIcon } from "lucide-react"

import { ProviderCard } from "@/components/provider-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { categories, providers, type Provider } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function providerMatchesQuery(provider: Provider, query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  return [
    provider.name,
    provider.category,
    provider.area,
    provider.bio,
    ...provider.services,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery)
}

export function DiscoverExperience() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<(typeof categories)[number]>("Todos")

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const matchesCategory =
        category === "Todos" || provider.category === category
      return matchesCategory && providerMatchesQuery(provider, query)
    })
  }, [category, query])

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold">
          Explorar servicios
        </h1>
        <p className="text-sm text-muted-foreground">
          Busca por proveedor, servicio, categoría o zona.
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-primary/10 bg-card p-3 shadow-sm shadow-primary/5">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, servicio o zona..."
          aria-label="Buscar servicios"
          className="h-10"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              type="button"
              variant={category === cat ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{filteredProviders.length} resultados</Badge>
          {query || category !== "Todos" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 rounded-full px-2"
              onClick={() => {
                setQuery("")
                setCategory("Todos")
              }}
            >
              Limpiar filtros
            </Button>
          ) : null}
        </div>
      </div>

      {filteredProviders.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader className="items-center text-center">
            <SearchXIcon className="text-muted-foreground" />
            <CardTitle>No encontramos proveedores</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <p className="max-w-sm text-sm text-muted-foreground">
              Prueba otra categoría, escribe una zona más amplia o limpia los
              filtros para volver al catálogo completo.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQuery("")
                setCategory("Todos")
              }}
            >
              Ver todos
            </Button>
          </CardContent>
        </Card>
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
