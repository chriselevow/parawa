import Link from "next/link"

import { PrototypeShell } from "@/components/prototype-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  return (
    <PrototypeShell>
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Entrar a Parawa</CardTitle>
          <CardDescription>
            Prototipo: cualquier botón te lleva a explorar servicios.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" placeholder="tu@correo.com" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/discover" className={cn(buttonVariants(), "w-full")}>
            Iniciar sesión
          </Link>
          <Link
            href="/provider"
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Entrar como proveedor
          </Link>
          <p className="text-center text-xs text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/discover" className="text-primary underline-offset-4 hover:underline">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </Card>
    </PrototypeShell>
  )
}
