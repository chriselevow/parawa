import Link from "next/link"

import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buttonVariants } from "@/components/ui/button"
import { getProviders } from "@/lib/parawa-data"
import { cn } from "@/lib/utils"

export default async function AdminProvidersPage() {
  const providers = await getProviders()

  return (
    <AdminShell
      active="/admin/providers"
      title="Proveedores"
      description="Gestión de perfiles y servicios publicados"
    >
      <div className="grid gap-3 md:hidden">
        {providers.map((p) => (
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
            {providers.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.area}</TableCell>
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
    </AdminShell>
  )
}
