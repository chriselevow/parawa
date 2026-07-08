import { ShieldCheckIcon } from "lucide-react"

import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

export default async function AdminVerificationsPage() {
  const { pendingVerifications } = await getAdminData()

  return (
    <AdminShell
      active="/admin/verifications"
      title="Verificaciones"
      description="Cola de proveedores pendientes de aprobación"
    >
      {pendingVerifications.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {pendingVerifications.map((item) => (
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
                <Button size="sm" className="w-full sm:w-auto">
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Rechazar
                </Button>
                <Button size="sm" variant="ghost" className="w-full sm:w-auto">
                  Ver docs
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="border border-border/70 bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldCheckIcon />
            </EmptyMedia>
            <EmptyTitle>No hay verificaciones pendientes</EmptyTitle>
            <EmptyDescription>
              Los proveedores importados desde Firebase ya no tienen documentos
              pendientes en esta vista.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </AdminShell>
  )
}
