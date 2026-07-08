"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  SearchXIcon,
} from "lucide-react"

import type { Provider } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
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

const SERVICE_PICKER_PAGE_SIZE = 6

function pageServices(services: string[], page: number) {
  const totalPages = Math.max(
    Math.ceil(services.length / SERVICE_PICKER_PAGE_SIZE),
    1
  )
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const startIndex = (safePage - 1) * SERVICE_PICKER_PAGE_SIZE

  return {
    page: safePage,
    totalPages,
    visibleServices: services.slice(
      startIndex,
      startIndex + SERVICE_PICKER_PAGE_SIZE
    ),
  }
}

export function BookServiceDialog({ provider }: { provider: Provider }) {
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [serviceQuery, setServiceQuery] = useState("")
  const [selectedService, setSelectedService] = useState(provider.services[0])
  const [servicePage, setServicePage] = useState(1)
  const filteredServices = useMemo(() => {
    const normalizedQuery = serviceQuery.trim().toLowerCase()

    if (!normalizedQuery) return provider.services

    return provider.services.filter((service) =>
      service.toLowerCase().includes(normalizedQuery)
    )
  }, [provider.services, serviceQuery])
  const { page, totalPages, visibleServices } = pageServices(
    filteredServices,
    servicePage
  )
  const hasServiceSearch = Boolean(serviceQuery.trim())

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
              <p className="break-anywhere font-medium">{selectedService}</p>
              <p className="break-anywhere text-muted-foreground">
                Vie 23 May · 3:00 PM · desde ${provider.priceFrom}
              </p>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <DialogClose
                render={
                  <Button variant="outline" className="w-full sm:flex-1" />
                }
              >
                Seguir viendo
              </DialogClose>
              <Link
                href="/bookings"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants(), "w-full sm:flex-1")}
              >
                Ver mis reservas
              </Link>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="break-anywhere">
                Reservar con {provider.name}
              </DialogTitle>
              <DialogDescription>
                Confirma una solicitud demo. Si no has entrado, te pedirá acceso
                de cliente al abrir tus reservas.
              </DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="service-search">Servicio</Label>
                  <Badge variant="outline">
                    {filteredServices.length} de {provider.services.length}
                  </Badge>
                </div>
                <div className="grid gap-3 rounded-xl border border-primary/10 bg-muted/25 p-3">
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="service-search"
                      value={serviceQuery}
                      onChange={(event) => {
                        setServiceQuery(event.target.value)
                        setServicePage(1)
                      }}
                      placeholder="Buscar servicio..."
                      className="h-10 bg-background pl-8"
                    />
                  </div>
                  {visibleServices.length ? (
                    <>
                      <div className="grid gap-2">
                        {visibleServices.map((service) => {
                          const isSelected = selectedService === service

                          return (
                            <button
                              key={service}
                              type="button"
                              aria-pressed={isSelected}
                              className={cn(
                                "flex min-w-0 items-start justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-left transition-colors hover:border-primary/35 hover:bg-primary/5",
                                isSelected &&
                                  "border-primary/50 bg-primary/10 text-primary"
                              )}
                              onClick={() => setSelectedService(service)}
                            >
                              <span className="break-anywhere font-medium">
                                {service}
                              </span>
                              {isSelected ? (
                                <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
                              ) : null}
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Página {page} de {totalPages}
                        </span>
                        <div className="grid grid-cols-2 gap-2 sm:flex">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-background"
                            disabled={page <= 1}
                            onClick={() =>
                              setServicePage((current) =>
                                Math.max(current - 1, 1)
                              )
                            }
                          >
                            <ChevronLeftIcon data-icon="inline-start" />
                            Anterior
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-background"
                            disabled={page >= totalPages}
                            onClick={() =>
                              setServicePage((current) =>
                                Math.min(current + 1, totalPages)
                              )
                            }
                          >
                            Siguiente
                            <ChevronRightIcon data-icon="inline-end" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Empty className="min-h-36 border border-border/70 bg-background">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <SearchXIcon />
                        </EmptyMedia>
                        <EmptyTitle>Sin servicios</EmptyTitle>
                        <EmptyDescription>
                          No hay servicios con esa búsqueda.
                        </EmptyDescription>
                      </EmptyHeader>
                      {hasServiceSearch ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setServiceQuery("")
                            setServicePage(1)
                          }}
                        >
                          Limpiar
                        </Button>
                      ) : null}
                    </Empty>
                  )}
                </div>
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
                render={
                  <Button variant="outline" className="w-full sm:flex-1" />
                }
              >
                Cancelar
              </DialogClose>
              <Button
                className="w-full sm:flex-1"
                onClick={() => setConfirmed(true)}
              >
                Confirmar reserva
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
