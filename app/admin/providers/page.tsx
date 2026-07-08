import Link from "next/link"
import { WrenchIcon } from "lucide-react"

import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
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

export default async function AdminProvidersPage() {
  const providers = await getProviders()
  const visibleProviders = providers.slice(0, ADMIN_PROVIDERS_LIMIT)
  const hiddenCount = Math.max(providers.length - visibleProviders.length, 0)
  const verifiedCount = providers.filter((provider) => provider.verified).length
  const pendingCount = providers.length - verifiedCount

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
                  {!p.verified ? <Button size="sm">Aprobar</Button> : null}
                  <Button size="sm" variant="ghost">
                    Suspender
                  </Button>
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
                        {!p.verified && <Button size="sm">Aprobar</Button>}
                        <Button size="sm" variant="outline">
                          Suspender
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {hiddenCount ? (
            <Card size="sm">
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {visibleProviders.length} de {providers.length}
                  proveedores. La siguiente etapa debe agregar búsqueda por
                  nombre, categoría y estado.
                </p>
                <Badge variant="outline">{hiddenCount} fuera de vista</Badge>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : (
        <Empty className="border border-border/70 bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WrenchIcon />
            </EmptyMedia>
            <EmptyTitle>No hay proveedores importados</EmptyTitle>
            <EmptyDescription>
              Cuando Firebase devuelva usuarios proveedores, aparecerán aquí con
              estado de verificación y acciones operativas.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </AdminShell>
  )
}
