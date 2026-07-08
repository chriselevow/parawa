"use client"

import Link from "next/link"
import { useState } from "react"
import { CheckCircle2Icon } from "lucide-react"

import type { Provider } from "@/lib/mock-data"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export function BookServiceDialog({ provider }: { provider: Provider }) {
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setConfirmed(false)
      }}
    >
      <DialogTrigger
        render={
          <Button
            size="lg"
            className="min-h-12 flex-1 px-5 text-base font-semibold"
          />
        }
      >
        Reservar
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {confirmed ? (
          <>
            <DialogHeader>
              <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-[#e7f7f3] text-[#087466]">
                <CheckCircle2Icon />
              </div>
              <DialogTitle>Solicitud creada</DialogTitle>
              <DialogDescription>
                Guardamos esta reserva como demo. En la versión con Firebase se
                creará en Firestore y notificará al proveedor.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-xl border bg-muted/35 p-3 text-sm">
              <p className="font-medium">{provider.services[0]}</p>
              <p className="text-muted-foreground">
                Vie 23 May · 3:00 PM · desde ${provider.priceFrom}
              </p>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <DialogClose
                render={<Button variant="outline" className="sm:flex-1" />}
              >
                Seguir viendo
              </DialogClose>
              <Link
                href="/bookings"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants(), "sm:flex-1")}
              >
                Ver mis reservas
              </Link>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Reservar con {provider.name}</DialogTitle>
              <DialogDescription>
                Confirma una solicitud demo. Si no has entrado, te pedirá acceso
                de cliente al abrir tus reservas.
              </DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="service">Servicio</Label>
                <Select defaultValue={provider.services[0]}>
                  <SelectTrigger id="service" className="w-full">
                    <SelectValue placeholder="Elige un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {provider.services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Select defaultValue="vie-23">
                    <SelectTrigger id="date" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="vie-23">Vie 23 May</SelectItem>
                        <SelectItem value="sab-24">Sáb 24 May</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="time">Hora</Label>
                  <Select defaultValue="15:00">
                    <SelectTrigger id="time" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Ej. tengo estacionamiento en el edificio"
                  rows={3}
                />
              </div>
            </form>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <DialogClose
                render={<Button variant="outline" className="sm:flex-1" />}
              >
                Cancelar
              </DialogClose>
              <Button className="sm:flex-1" onClick={() => setConfirmed(true)}>
                Confirmar reserva
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
