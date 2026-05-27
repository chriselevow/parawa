import Link from "next/link"

import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { providers } from "@/lib/mock-data"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AdminProvidersPage() {
  return (
    <AdminShell
      active="/admin/providers"
      title="Proveedores"
      description="Gestión de perfiles y servicios publicados"
    >
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
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    Ver
                  </Link>
                  {!p.verified && (
                    <Button size="sm">Aprobar</Button>
                  )}
                  <Button size="sm" variant="outline">
                    Suspender
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminShell>
  )
}
