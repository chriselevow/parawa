"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  SearchIcon,
  SearchXIcon,
} from "lucide-react"

import type { Provider } from "@/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

export type BookableService = {
  id: string
  title: string
  description: string
  category: string
  price: number
  duration: string
  imageUrl?: string
  isPackage: boolean
  productsCount: number
  productsPreview: string
}

const SERVICE_PICKER_PAGE_SIZE = 4
const BOOKING_DATE_OPTIONS = [
  { value: "2026-07-10", label: "Vie 10 Jul" },
  { value: "2026-07-11", label: "Sáb 11 Jul" },
]
const BOOKING_TIME_OPTIONS = [
  { value: "10:00", label: "10:00 AM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "18:00", label: "6:00 PM" },
]

type BookingCreateResponse = {
  bookingId?: string
  code?: string
  error?: string
  loginHref?: string
  message?: string
  persisted?: boolean
}

function pageServices(services: BookableService[], page: number) {
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

function fallbackServicesForProvider(provider: Provider): BookableService[] {
  const providerServices = provider.services.length
    ? provider.services
    : ["Servicio Parawa"]

  return providerServices.map((service) => ({
    id: service,
    title: service,
    description: provider.bio,
    category: provider.category,
    price: provider.priceFrom,
    duration: "Por confirmar",
    isPackage: false,
    productsCount: 0,
    productsPreview: "",
  }))
}

function defaultServiceForProvider(provider: Provider): BookableService {
  return fallbackServicesForProvider(provider)[0]
}

function serviceMatchesQuery(service: BookableService, query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  return [
    service.id,
    service.title,
    service.description,
    service.category,
    service.duration,
    service.productsPreview,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery)
}

export function BookServiceDialog({
  provider,
  services,
}: {
  provider: Provider
  services?: BookableService[]
}) {
  const serviceOptions = useMemo(
    () => (services?.length ? services : fallbackServicesForProvider(provider)),
    [provider, services]
  )
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [bookingResult, setBookingResult] =
    useState<BookingCreateResponse | null>(null)
  const [bookingError, setBookingError] =
    useState<BookingCreateResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serviceQuery, setServiceQuery] = useState("")
  const [selectedServiceId, setSelectedServiceId] = useState(
    serviceOptions[0]?.id ?? defaultServiceForProvider(provider).id
  )
  const [servicePage, setServicePage] = useState(1)
  const [selectedDate, setSelectedDate] = useState(
    BOOKING_DATE_OPTIONS[0].value
  )
  const [selectedTime, setSelectedTime] = useState(
    BOOKING_TIME_OPTIONS[1].value
  )
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const selectedService =
    serviceOptions.find((service) => service.id === selectedServiceId) ??
    serviceOptions[0] ??
    defaultServiceForProvider(provider)
  const selectedDateLabel =
    BOOKING_DATE_OPTIONS.find((option) => option.value === selectedDate)
      ?.label ?? selectedDate
  const selectedTimeLabel =
    BOOKING_TIME_OPTIONS.find((option) => option.value === selectedTime)
      ?.label ?? selectedTime
  const filteredServices = useMemo(() => {
    return serviceOptions.filter((service) =>
      serviceMatchesQuery(service, serviceQuery)
    )
  }, [serviceOptions, serviceQuery])
  const { page, totalPages, visibleServices } = pageServices(
    filteredServices,
    servicePage
  )
  const hasServiceSearch = Boolean(serviceQuery.trim())

  async function confirmBooking() {
    setIsSubmitting(true)
    setBookingError(null)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          address,
          date: selectedDate,
          notes,
          providerId: provider.id,
          providerName: provider.name,
          service: {
            category: selectedService.category,
            duration: selectedService.duration,
            id: selectedService.id,
            price: selectedService.price,
            title: selectedService.title,
          },
          time: selectedTime,
        }),
      })
      const json = (await response.json()) as BookingCreateResponse

      if (!response.ok && response.status !== 202) {
        setBookingError(json)
        return
      }

      setBookingResult(json)
      setConfirmed(true)
    } catch {
      setBookingError({
        error: "No pudimos preparar la reserva. Intenta nuevamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setBookingError(null)
          setBookingResult(null)
          setConfirmed(false)
        }
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
      <DialogContent className="sm:max-w-lg">
        {confirmed ? (
          <>
            <DialogHeader>
              <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-[#e7f7f3] text-[#087466]">
                <CheckCircle2Icon />
              </div>
              <DialogTitle>
                {bookingResult?.persisted
                  ? "Reserva guardada"
                  : "Solicitud preparada"}
              </DialogTitle>
              <DialogDescription>
                {bookingResult?.message ??
                  "La solicitud quedó preparada para revisar el flujo."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 rounded-xl border bg-muted/35 p-3 text-sm">
              <div className="flex items-start gap-3">
                <Avatar className="size-12 rounded-xl">
                  {selectedService.imageUrl ? (
                    <AvatarImage
                      alt=""
                      src={selectedService.imageUrl}
                      className="rounded-xl"
                    />
                  ) : null}
                  <AvatarFallback className="rounded-xl">
                    <ImageIcon className="size-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="break-anywhere font-medium">
                    {selectedService.title}
                  </p>
                  <p className="break-anywhere text-muted-foreground">
                    {selectedDateLabel} · {selectedTimeLabel} · $
                    {selectedService.price}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {bookingResult?.persisted ? (
                  <Badge>Firestore</Badge>
                ) : (
                  <Badge variant="outline">Demo</Badge>
                )}
                <Badge variant="secondary">{selectedService.category}</Badge>
                <Badge variant="outline">{selectedService.duration}</Badge>
                {selectedService.isPackage ? <Badge>Paquete</Badge> : null}
                {bookingResult?.code ? (
                  <Badge variant="outline">{bookingResult.code}</Badge>
                ) : null}
              </div>
              {address || notes ? (
                <div className="grid gap-1 rounded-lg border bg-background/80 p-2 text-xs text-muted-foreground">
                  {address ? (
                    <p className="break-anywhere">Dirección: {address}</p>
                  ) : null}
                  {notes ? (
                    <p className="break-anywhere">Notas: {notes}</p>
                  ) : null}
                </div>
              ) : null}
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
                Confirma una solicitud. Si entraste con Firebase se guardará en
                Firestore; si estás en demo, quedará como flujo de prueba.
              </DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="service-search">Servicio</Label>
                  <Badge variant="outline">
                    {filteredServices.length} de {serviceOptions.length}
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
                      <div className="grid max-h-80 gap-2 overflow-y-auto pr-1">
                        {visibleServices.map((service) => {
                          const isSelected = selectedService.id === service.id

                          return (
                            <button
                              key={service.id}
                              type="button"
                              aria-pressed={isSelected}
                              className={cn(
                                "grid min-w-0 gap-3 rounded-xl border bg-background p-3 text-left transition-colors hover:border-primary/35 hover:bg-primary/5",
                                isSelected &&
                                  "border-primary/50 bg-primary/10 text-primary"
                              )}
                              onClick={() => setSelectedServiceId(service.id)}
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="size-12 rounded-xl">
                                  {service.imageUrl ? (
                                    <AvatarImage
                                      alt=""
                                      src={service.imageUrl}
                                      className="rounded-xl"
                                    />
                                  ) : null}
                                  <AvatarFallback className="rounded-xl">
                                    <ImageIcon className="size-5" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <span className="break-anywhere font-medium">
                                      {service.title}
                                    </span>
                                    <Badge variant="outline">
                                      ${service.price}
                                    </Badge>
                                  </div>
                                  <p className="break-anywhere mt-1 line-clamp-2 text-xs text-muted-foreground">
                                    {service.description}
                                  </p>
                                </div>
                                {isSelected ? (
                                  <CheckCircle2Icon className="mt-1 size-4 shrink-0" />
                                ) : null}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                <Badge variant="secondary">
                                  {service.category}
                                </Badge>
                                <Badge variant="outline">
                                  {service.duration}
                                </Badge>
                                {service.isPackage ? (
                                  <Badge>Paquete</Badge>
                                ) : null}
                                {service.productsCount ? (
                                  <Badge variant="outline">
                                    {service.productsCount} productos
                                  </Badge>
                                ) : null}
                              </div>
                              {service.productsPreview ? (
                                <p className="break-anywhere rounded-lg border bg-muted/35 p-2 text-xs text-muted-foreground">
                                  {service.productsPreview}
                                </p>
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
                  <Select
                    value={selectedDate}
                    onValueChange={(value) => {
                      if (value) setSelectedDate(value)
                    }}
                  >
                    <SelectTrigger id="date" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {BOOKING_DATE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="time">Hora</Label>
                  <Select
                    value={selectedTime}
                    onValueChange={(value) => {
                      if (value) setSelectedTime(value)
                    }}
                  >
                    <SelectTrigger id="time" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {BOOKING_TIME_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Ej. PH Central, San Francisco"
                  className="h-10"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Ej. tengo estacionamiento en el edificio"
                  rows={3}
                />
              </div>
              {bookingError ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircleIcon className="mt-0.5 size-4 text-destructive" />
                    <div className="min-w-0">
                      <p className="font-semibold text-destructive">
                        No se pudo guardar
                      </p>
                      <p className="break-anywhere mt-1 text-muted-foreground">
                        {bookingError.error ??
                          "Revisa tu sesión e intenta nuevamente."}
                      </p>
                      {bookingError.loginHref ? (
                        <Link
                          href={bookingError.loginHref}
                          className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          Entrar como cliente
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
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
                disabled={isSubmitting}
                onClick={confirmBooking}
              >
                {isSubmitting ? "Guardando..." : "Confirmar reserva"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
