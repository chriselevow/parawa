"use client"

import Link from "next/link"
import { useState } from "react"

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="flex-1" />}>Reservar</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reservar con {provider.name}</DialogTitle>
          <DialogDescription>
            Prototipo: el formulario no guarda datos. Te lleva a tus reservas.
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
          <DialogClose render={<Button variant="outline" className="sm:flex-1" />}>
            Cancelar
          </DialogClose>
          <Link
            href="/bookings"
            onClick={() => setOpen(false)}
            className={cn(buttonVariants(), "sm:flex-1")}
          >
            Confirmar reserva
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
