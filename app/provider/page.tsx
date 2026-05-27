import Link from "next/link"
import { CalendarIcon, DollarSignIcon, InboxIcon } from "lucide-react"

import { PrototypeShell } from "@/components/prototype-shell"
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
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const requests = [
  {
    id: "r1",
    client: "Pedro L.",
    service: "Gel nails",
    when: "Vie 23 May · 3:00 PM",
    status: "Nueva",
  },
  {
    id: "r2",
    client: "Lucía R.",
    service: "Manicure clásico",
    when: "Sáb 24 May · 11:00 AM",
    status: "Nueva",
  },
]

export default function ProviderDashboardPage() {
  return (
    <PrototypeShell active="/provider">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold">Panel proveedor</h1>
        <p className="text-sm text-muted-foreground">
          Vista de María González · prototipo clickeable
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: InboxIcon, label: "Solicitudes", value: "2 nuevas" },
          { icon: CalendarIcon, label: "Esta semana", value: "5 citas" },
          { icon: DollarSignIcon, label: "Ingresos", value: "$280" },
        ].map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <stat.icon className="text-primary" />
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle>{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitudes entrantes</CardTitle>
          <CardDescription>Acepta o rechaza desde aquí (demo)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{req.client}</p>
                <p className="text-sm text-muted-foreground">
                  {req.service} · {req.when}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{req.status}</Badge>
                <Button size="sm">Aceptar</Button>
                <Button size="sm" variant="outline">
                  Rechazar
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Link href="/discover" className={cn(buttonVariants({ variant: "ghost" }))}>
            Ver mi perfil público →
          </Link>
        </CardFooter>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Mi perfil</CardTitle>
          <CardDescription>Gestiona servicios y horarios</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2">
          <Button variant="outline">Editar servicios</Button>
          <Button variant="outline">Horarios</Button>
          <Button variant="outline">Portafolio</Button>
        </CardFooter>
      </Card>
    </PrototypeShell>
  )
}
