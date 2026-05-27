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
import { pendingVerifications } from "@/lib/admin-mock-data"

export default function AdminVerificationsPage() {
  return (
    <AdminShell
      active="/admin/verifications"
      title="Verificaciones"
      description="Cola de proveedores pendientes de aprobación"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {pendingVerifications.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.category}</CardDescription>
                </div>
                <Badge variant="secondary">{item.submitted}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Documentos: {item.documents}
              </p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button size="sm">Aprobar</Button>
              <Button size="sm" variant="outline">
                Rechazar
              </Button>
              <Button size="sm" variant="ghost">
                Ver docs
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </AdminShell>
  )
}
