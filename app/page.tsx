import Link from "next/link"
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CreditCardIcon,
  MessageCircleIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react"

import { LandingShell } from "@/components/landing-shell"
import { ProviderCard } from "@/components/provider-card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { categories, providers } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  return (
    <LandingShell>
      <section className="border-b bg-linear-to-b from-primary/5 to-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:py-24 lg:flex-row lg:items-center lg:gap-12">
          <div className="flex flex-1 flex-col gap-6">
            <Badge variant="secondary" className="w-fit">
              100% panameño · Economía local
            </Badge>
            <h1 className="max-w-2xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              El mercado de servicios que Panamá necesita
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Conecta hogares y negocios con proveedores verificados. Explora,
              chatea, reserva y paga sin efectivo — todo desde una sola app.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/discover"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Buscar servicios
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
              <Link
                href="/login?role=provider&next=%2Fprovider"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" })
                )}
              >
                Ofrecer mis servicios
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span>+180 proveedores</span>
              <span>·</span>
              <span>Pagos seguros</span>
              <span>·</span>
              <span>Reseñas reales</span>
            </div>
          </div>
          <Card className="w-full max-w-md shrink-0 lg:max-w-sm">
            <CardHeader>
              <CardTitle>Reserva en 3 pasos</CardTitle>
              <CardDescription>Así de simple para clientes</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {[
                { icon: SearchIcon, text: "Explora por categoría o zona" },
                {
                  icon: MessageCircleIcon,
                  text: "Chatea y personaliza tu pedido",
                },
                { icon: CreditCardIcon, text: "Paga con tarjeta al confirmar" },
              ].map((step, i) => (
                <div key={step.text} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {i + 1}
                  </span>
                  <step.icon className="text-muted-foreground" />
                  <span className="text-sm">{step.text}</span>
                </div>
              ))}
              <Link
                href="/discover"
                className={cn(buttonVariants(), "mt-2 w-full")}
              >
                Probar prototipo
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "1.2k+", label: "Usuarios activos" },
            { value: "186", label: "Proveedores" },
            { value: "4.8", label: "Rating promedio" },
            { value: "98%", label: "Pagos sin efectivo" },
          ].map((stat) => (
            <Card key={stat.label} size="sm">
              <CardHeader>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
                <CardDescription>{stat.label}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="border-y bg-muted/20 py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4">
          <div className="max-w-xl">
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
              Cómo funciona Parawa
            </h2>
            <p className="mt-2 text-muted-foreground">
              Dos experiencias en una plataforma: quien necesita un servicio y
              quien lo ofrece.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <UsersIcon className="text-primary" />
                <CardTitle>Para clientes</CardTitle>
                <CardDescription>Hogares y negocios</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <li>· Encuentra proveedores verificados cerca de ti</li>
                  <li>· Compara precios, reseñas y portafolios</li>
                  <li>· Reserva a domicilio o en el local del profesional</li>
                  <li>· Califica al terminar el servicio</li>
                </ul>
                <Link
                  href="/discover"
                  className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
                >
                  Explorar servicios
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BadgeCheckIcon className="text-primary" />
                <CardTitle>Para proveedores</CardTitle>
                <CardDescription>Independientes y PYMEs</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <li>· Crea tu perfil y publica servicios gratis</li>
                  <li>· Define horarios, precios y zona de cobertura</li>
                  <li>· Acepta solicitudes con flexibilidad</li>
                  <li>· Cobros seguros directo en la app</li>
                </ul>
                <Link
                  href="/login?role=provider&next=%2Fprovider"
                  className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
                >
                  Panel proveedor
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="font-heading text-2xl font-semibold">
          Categorías populares
        </h2>
        <p className="mt-1 text-muted-foreground">
          Los servicios más buscados en Panamá
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {categories
            .filter((c) => c !== "Todos")
            .map((cat) => (
              <Link key={cat} href="/discover">
                <Badge
                  variant="outline"
                  className="border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary hover:bg-primary/10"
                >
                  {cat}
                </Badge>
              </Link>
            ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold">
              Proveedores destacados
            </h2>
            <p className="text-muted-foreground">Confianza de tu comunidad</p>
          </div>
          <Link
            href="/discover"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Ver todos
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {providers.slice(0, 4).map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      </section>

      <section className="border-t bg-primary px-4 py-14 text-primary-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 text-center">
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            Únete a Parawa hoy
          </h2>
          <p className="max-w-lg text-primary-foreground/80">
            Ya sea que busques quién te ayude o quieras hacer crecer tu negocio,
            Parawa es donde Panamá trabaja.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/discover"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-background text-foreground hover:bg-background/90"
              )}
            >
              Empezar como cliente
            </Link>
            <Link
              href="/login?role=client&next=%2Fdiscover"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-background bg-background text-primary hover:bg-background/90 hover:text-primary"
              )}
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </section>
    </LandingShell>
  )
}
