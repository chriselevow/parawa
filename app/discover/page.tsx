import Link from "next/link"

import { PrototypeShell } from "@/components/prototype-shell"
import { ProviderCard } from "@/components/provider-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button"
import { categories, providers } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function DiscoverPage() {
  return (
    <PrototypeShell active="/discover">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold">Explorar servicios</h1>
        <p className="text-sm text-muted-foreground">
          Filtra por categoría (prototipo — sin lógica real).
        </p>
      </div>

      <Input placeholder="Buscar por nombre o zona…" />

      <div className="flex flex-wrap gap-2">
        {categories.map((cat, i) => (
          <Badge key={cat} variant={i === 0 ? "default" : "outline"}>
            {cat}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>

      <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "self-start")}>
        ← Inicio
      </Link>
    </PrototypeShell>
  )
}
