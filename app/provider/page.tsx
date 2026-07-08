import Link from "next/link"
import {
  ActivityIcon,
  ArrowUpRightIcon,
  BadgeCheckIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  Clock3Icon,
  CreditCardIcon,
  EyeIcon,
  GaugeIcon,
  InboxIcon,
  MapPinIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  TrendingUpIcon,
  UserRoundCheckIcon,
  WalletIcon,
} from "lucide-react"

import {
  AdminListControls,
  AdminPagination,
  normalizeAdminListSearchParams,
  pageItems,
} from "@/components/admin-list-controls"
import { PrototypeShell } from "@/components/prototype-shell"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
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
import { type Booking, statusLabel } from "@/lib/mock-data"
import {
  getParawaData,
  getProviderForSession,
  type PunctualityValue,
} from "@/lib/parawa-data"
import { getActiveSession } from "@/lib/session"
import { cn } from "@/lib/utils"

const PROVIDER_REQUEST_PAGE_LIMIT = 6
const PROVIDER_REQUEST_FILTER_OPTIONS = [
  { label: "Todas activas", value: "all" },
  { label: "Nuevas", value: "pending" },
  { label: "Confirmadas", value: "accepted" },
]

type ProviderRequestRow = {
  id: string
  client: string
  service: string
  serviceCount?: number
  when: string
  amount: string
  distance: string
  status: string
  note: string
}

type ProviderAgendaRow = {
  id: string
  time: string
  client: string
  service: string
  serviceCount?: number
  status: string
}

const fallbackProviderProfile = {
  name: "María González",
  business: "Maria Nails Studio",
  category: "Uñas y manicure",
  area: "San Francisco, Ciudad de Panamá",
  status: "Abierta hoy",
  response: "4 min",
  rating: "4.9",
  reviews: "128 reseñas",
  profileScore: 92,
}

const fallbackStats = [
  {
    icon: InboxIcon,
    label: "Solicitudes nuevas",
    value: "4",
    detail: "+2 desde ayer",
    tone: "text-primary",
  },
  {
    icon: CalendarDaysIcon,
    label: "Citas próximas",
    value: "8",
    detail: "3 hoy · 5 esta semana",
    tone: "text-[#0f8f7a]",
  },
  {
    icon: WalletIcon,
    label: "Ingresos semana",
    value: "$420",
    detail: "+18% vs. semana pasada",
    tone: "text-[#a06400]",
  },
  {
    icon: StarIcon,
    label: "Calidad",
    value: "4.9",
    detail: "98% confirmadas",
    tone: "text-[#c48100]",
  },
]

const fallbackRequests: ProviderRequestRow[] = [
  {
    id: "r1",
    client: "Pedro L.",
    service: "Gel nails",
    when: "Vie 23 May · 3:00 PM",
    amount: "$35",
    distance: "1.8 km",
    status: "Nueva",
    note: "Prefiere diseño natural y horario puntual.",
  },
  {
    id: "r2",
    client: "Lucía R.",
    service: "Manicure clásico",
    when: "Sáb 24 May · 11:00 AM",
    amount: "$25",
    distance: "3.2 km",
    status: "Nueva",
    note: "Cliente recurrente, pidió confirmación por chat.",
  },
  {
    id: "r3",
    client: "Andrea P.",
    service: "Pedicure spa",
    when: "Sáb 24 May · 4:30 PM",
    amount: "$45",
    distance: "2.4 km",
    status: "Pendiente",
    note: "Quiere agregar retiro de gel si hay tiempo.",
  },
]

const fallbackAgenda: ProviderAgendaRow[] = [
  {
    id: "a1",
    time: "10:00",
    client: "Nathalia M.",
    service: "Manicure clásico",
    status: "Confirmada",
  },
  {
    id: "a2",
    time: "13:30",
    client: "Camila S.",
    service: "Gel nails",
    status: "Por llegar",
  },
  {
    id: "a3",
    time: "17:00",
    client: "Valeria G.",
    service: "Pedicure spa",
    status: "Confirmada",
  },
]

const fallbackProfileHealth = [
  { label: "Fotos de trabajos", value: "12/15", complete: true },
  { label: "Horarios actualizados", value: "Hoy", complete: true },
  { label: "Métodos de pago", value: "2 activos", complete: true },
  { label: "Política de cancelación", value: "Falta", complete: false },
]

const fallbackServices = [
  { name: "Gel nails", revenue: "$210", bookings: "6 reservas", trend: "+24%" },
  {
    name: "Manicure clásico",
    revenue: "$125",
    bookings: "5 reservas",
    trend: "+8%",
  },
  {
    name: "Pedicure spa",
    revenue: "$85",
    bookings: "2 reservas",
    trend: "Nuevo",
  },
]

const fallbackActivity = [
  "Lucía R. abrió el chat hace 8 min",
  "Tu perfil recibió 43 visitas esta semana",
  "Pago de Pedro L. listo al confirmar",
]

function providerBookingMatchesQuery(booking: Booking, query: string) {
  if (!query) return true
  const normalizedQuery = query.toLowerCase()

  return [
    booking.id,
    booking.code,
    booking.clientName,
    booking.providerName,
    booking.service,
    booking.serviceNames?.join(" "),
    booking.serviceCount,
    booking.date,
    booking.shortDate,
    booking.time,
    booking.serviceLocation,
    booking.address,
    booking.notes,
    booking.paymentMethod,
    booking.paymentStatus,
    booking.status,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery)
}

function punctualityLabel(value: PunctualityValue) {
  if (value === "yes") return "Puntual"
  if (value === "no") return "Tarde"
  return "Sin respuesta"
}

function punctualityClassName(value: PunctualityValue) {
  if (value === "yes") return "bg-[#e7f7f3] text-[#087466]"
  if (value === "no") return "bg-destructive/10 text-destructive"
  return ""
}

export default async function ProviderDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{
    filter?: string
    page?: string
    q?: string
  }>
}) {
  const params = await searchParams
  const {
    filter: requestFilter,
    page: requestPage,
    q: requestQuery,
  } = normalizeAdminListSearchParams(
    params,
    PROVIDER_REQUEST_FILTER_OPTIONS.map((option) => option.value)
  )
  const { userId } = await getActiveSession()
  const data = await getParawaData()
  const provider = await getProviderForSession(userId)
  const providerSlotSummary = provider
    ? data.providerSlotSummaries.find(
        (summary) => summary.providerId === provider.id
      )
    : undefined
  const providerQualitySummary = provider
    ? data.providerQualitySummaries.find(
        (summary) => summary.providerId === provider.id
      )
    : undefined
  const providerBookings = data.bookings.filter(
    (booking) => booking.providerId === provider?.id
  )
  const activeBookings = providerBookings.filter(
    (booking) => booking.status === "accepted" || booking.status === "pending"
  )
  const completedBookings = providerBookings.filter(
    (booking) => booking.status === "completed"
  )
  const providerProfile = provider
    ? {
        name: provider.name,
        business: provider.name,
        category: provider.category,
        area: provider.area,
        status: activeBookings.length ? "Abierta hoy" : "Perfil activo",
        response: data.source === "firebase" ? "Firebase" : "4 min",
        rating: String(provider.rating),
        reviews: `${provider.reviews} reseñas`,
        profileScore: provider.verified ? 92 : 68,
      }
    : fallbackProviderProfile
  const providerProfileHref = `/providers/${provider?.id ?? "maria-nails"}`
  const stats = provider
    ? [
        {
          icon: InboxIcon,
          label: "Solicitudes nuevas",
          value: String(
            providerBookings.filter((booking) => booking.status === "pending")
              .length
          ),
          detail: `${activeBookings.length} activas`,
          tone: "text-primary",
        },
        {
          icon: CalendarDaysIcon,
          label: "Citas próximas",
          value: String(activeBookings.length),
          detail: `${providerBookings.length} reservas totales`,
          tone: "text-[#0f8f7a]",
        },
        {
          icon: WalletIcon,
          label: "Ingresos semana",
          value: `$${completedBookings.reduce(
            (sum, booking) => sum + booking.total,
            0
          )}`,
          detail: `${completedBookings.length} completadas`,
          tone: "text-[#a06400]",
        },
        {
          icon: StarIcon,
          label: "Calidad",
          value: providerQualitySummary
            ? `${providerQualitySummary.onTimeRate}%`
            : providerProfile.rating,
          detail: providerQualitySummary
            ? `${providerQualitySummary.onTime} puntuales · ${providerQualitySummary.late} tarde`
            : providerProfile.reviews,
          tone: "text-[#c48100]",
        },
      ]
    : fallbackStats
  const filteredRequestBookings = activeBookings.filter((booking) => {
    const matchesFilter =
      requestFilter === "all" || booking.status === requestFilter
    return matchesFilter && providerBookingMatchesQuery(booking, requestQuery)
  })
  const {
    end: requestEnd,
    page: currentRequestPage,
    start: requestStart,
    totalPages: requestTotalPages,
    visibleItems: visibleRequestBookings,
  } = pageItems(
    filteredRequestBookings,
    requestPage,
    PROVIDER_REQUEST_PAGE_LIMIT
  )
  const requestRows: ProviderRequestRow[] = visibleRequestBookings.map(
    (booking) => ({
      id: booking.id,
      client: booking.clientName,
      service: booking.service,
      serviceCount: booking.serviceCount,
      when: booking.date,
      amount: `$${booking.total}`,
      distance: booking.serviceLocation,
      status:
        booking.status === "pending" ? "Nueva" : statusLabel(booking.status),
      note: booking.notes,
    })
  )
  const usesFallbackRequests = !provider && data.source !== "firebase"
  const requests = usesFallbackRequests ? fallbackRequests : requestRows
  const hasActiveRequestFilters =
    Boolean(requestQuery) || requestFilter !== "all"
  const pendingRequestCount = activeBookings.filter(
    (booking) => booking.status === "pending"
  ).length
  const acceptedRequestCount = activeBookings.filter(
    (booking) => booking.status === "accepted"
  ).length
  const agendaRows: ProviderAgendaRow[] = activeBookings.map((booking) => ({
    id: booking.id,
    time: booking.time,
    client: booking.clientName,
    service: booking.service,
    serviceCount: booking.serviceCount,
    status: statusLabel(booking.status),
  }))
  const agenda =
    agendaRows.length || data.source === "firebase"
      ? agendaRows
      : fallbackAgenda
  const profileHealth = provider
    ? [
        {
          label: "Servicios publicados",
          value: `${provider.services.length}`,
          complete: Boolean(provider.services.length),
        },
        {
          label: "Horarios actualizados",
          value: providerSlotSummary
            ? `${providerSlotSummary.totalDays} días`
            : data.source === "firebase"
              ? "Sin horarios"
              : "Demo",
          complete: Boolean(providerSlotSummary) || data.source !== "firebase",
        },
        {
          label: "Métodos de pago",
          value: data.bookings.some(
            (booking) => booking.paymentStatus === "paid"
          )
            ? "Activos"
            : "Pendiente",
          complete: data.bookings.some(
            (booking) => booking.paymentStatus === "paid"
          ),
        },
        {
          label: "Política de cancelación",
          value: provider.verified ? "Lista" : "Falta",
          complete: provider.verified,
        },
      ]
    : fallbackProfileHealth
  const profilePendingCount = profileHealth.filter(
    (item) => !item.complete
  ).length
  const services = provider
    ? (provider.services.length
        ? provider.services
        : fallbackServices.map((service) => service.name)
      ).map((name) => {
        const normalizedName = name.toLowerCase()
        const relatedBookings = providerBookings.filter((booking) =>
          (booking.serviceNames ?? [booking.service]).some((service) =>
            service.toLowerCase().includes(normalizedName)
          )
        )
        return {
          name,
          revenue: `$${relatedBookings.reduce(
            (sum, booking) => sum + booking.total,
            0
          )}`,
          bookings: `${relatedBookings.length} reservas`,
          trend: relatedBookings.length ? "Activo" : "Nuevo",
        }
      })
    : fallbackServices
  const activity = provider
    ? [
        `${data.providers.length} proveedores normalizados`,
        `${data.bookings.length} reservas disponibles`,
        `${
          data.source === "firebase"
            ? "Datos Firebase activos"
            : "Mock local activo"
        }`,
      ]
    : fallbackActivity

  return (
    <PrototypeShell active="/provider">
      <section className="overflow-hidden rounded-2xl border border-primary/15 bg-[linear-gradient(135deg,#fafdff_0%,#edf6ff_52%,#ffffff_100%)] shadow-[0_24px_70px_rgba(11,27,47,0.08)]">
        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-6">
          <div className="flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className="bg-[#e7f7f3] text-[#087466]"
                  variant="outline"
                >
                  <span className="size-1.5 rounded-full bg-[#12a182]" />
                  {providerProfile.status}
                </Badge>
                <Badge variant="outline">
                  <ShieldCheckIcon data-icon="inline-start" />
                  {provider?.verified
                    ? "Perfil verificado"
                    : "Verificación pendiente"}
                </Badge>
              </div>
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-primary">
                  Portal proveedor
                </p>
                <h1 className="mt-1 font-heading text-3xl font-semibold tracking-normal text-foreground">
                  {providerProfile.business}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {providerProfile.name} · {providerProfile.category} ·{" "}
                  {providerProfile.area}
                </p>
              </div>
            </div>
            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Link
                href={providerProfileHref}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto"
                )}
              >
                <EyeIcon data-icon="inline-start" />
                Ver perfil público
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <CalendarDaysIcon data-icon="inline-start" />
                Editar disponibilidad
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <MessageCircleIcon data-icon="inline-start" />
                Responder chats
              </Button>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-primary/10 bg-white/70 p-4 shadow-sm shadow-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Estado operativo</p>
                <p className="text-xs text-muted-foreground">
                  Listo para recibir reservas
                </p>
              </div>
              <ActivityIcon className="text-primary" />
            </div>
            <div className="grid gap-2 min-[420px]:grid-cols-3">
              {[
                ["Respuesta", providerProfile.response],
                ["Rating", providerProfile.rating],
                ["Perfil", `${providerProfile.profileScore}%`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-primary/10 bg-background/80 p-3"
                >
                  <p className="break-anywhere text-[0.7rem] font-medium text-muted-foreground">
                    {label}
                  </p>
                  <p className="break-anywhere mt-1 font-heading text-lg font-semibold">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${providerProfile.profileScore}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {providerProfile.reviews} ·{" "}
              {profilePendingCount
                ? `${profilePendingCount} mejoras pequeñas pendientes`
                : "perfil operativo"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader className="gap-3">
              <div className="flex items-center justify-between">
                <div className="rounded-xl border border-primary/10 bg-secondary/50 p-2">
                  <stat.icon className={cn("size-4", stat.tone)} />
                </div>
                <Badge variant="outline">
                  <TrendingUpIcon data-icon="inline-start" />
                  Hoy
                </Badge>
              </div>
              <div>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="break-anywhere mt-1 text-2xl font-semibold">
                  {stat.value}
                </CardTitle>
                <p className="break-anywhere mt-1 text-xs text-muted-foreground">
                  {stat.detail}
                </p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <div id="solicitudes" className="flex scroll-mt-24 flex-col gap-3">
            {provider ? (
              <AdminListControls
                action="/provider"
                filterLabel="Estado"
                filterOptions={PROVIDER_REQUEST_FILTER_OPTIONS}
                filterValue={requestFilter}
                resultLabel={`${filteredRequestBookings.length} de ${activeBookings.length} solicitudes activas`}
                searchPlaceholder="Buscar por cliente, servicio, código o nota..."
                searchValue={requestQuery}
              />
            ) : null}

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Solicitudes entrantes</CardTitle>
                  <CardDescription className="space-y-2">
                    <div>
                      Prioriza reservas nuevas, confirma pagos y abre chat si
                      falta contexto.
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {activeBookings.length} activas
                      </Badge>
                      <Badge variant="secondary">
                        {pendingRequestCount} nuevas
                      </Badge>
                      <Badge variant="outline">
                        {acceptedRequestCount} confirmadas
                      </Badge>
                    </div>
                  </CardDescription>
                </div>
                <CardAction className="w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!activeBookings.length}
                  >
                    <SparklesIcon data-icon="inline-start" />
                    Autoordenar
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {requests.length ? (
                  requests.map((req) => (
                    <div
                      key={req.id}
                      className="grid gap-4 rounded-xl border border-border/75 bg-background/80 p-4 shadow-sm shadow-primary/5"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="break-anywhere font-semibold">
                            {req.client}
                          </p>
                          <Badge
                            className={cn(
                              req.status === "Nueva"
                                ? "bg-primary text-primary-foreground"
                                : "bg-[#fff3d7] text-[#7a5200]"
                            )}
                          >
                            {req.status}
                          </Badge>
                          <span className="text-sm font-semibold text-primary">
                            {req.amount}
                          </span>
                        </div>
                        <p className="break-anywhere mt-1 text-sm text-muted-foreground">
                          {req.service} · {req.when}
                        </p>
                        {req.serviceCount && req.serviceCount > 1 ? (
                          <Badge variant="secondary" className="mt-2 w-fit">
                            {req.serviceCount} servicios
                          </Badge>
                        ) : null}
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPinIcon className="size-3.5" />
                            {req.distance}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CreditCardIcon className="size-3.5" />
                            Pago al confirmar
                          </span>
                        </div>
                        <p className="break-anywhere mt-3 rounded-lg bg-muted/55 px-3 py-2 text-sm text-muted-foreground">
                          {req.note}
                        </p>
                      </div>
                      <div className="grid gap-2 border-t border-border/70 pt-3 min-[420px]:grid-cols-3 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
                        <Button
                          size="sm"
                          className="h-9 w-full rounded-lg px-3 shadow-sm sm:w-auto"
                        >
                          <CheckCircle2Icon data-icon="inline-start" />
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 w-full rounded-lg px-3 sm:w-auto"
                        >
                          <MessageCircleIcon data-icon="inline-start" />
                          Chat
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 w-full rounded-lg px-2.5 text-muted-foreground sm:w-auto"
                        >
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <Empty className="border border-border/70 bg-background/70">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <InboxIcon />
                      </EmptyMedia>
                      <EmptyTitle>
                        {hasActiveRequestFilters
                          ? "No hay solicitudes con esos filtros"
                          : "Sin solicitudes pendientes"}
                      </EmptyTitle>
                      <EmptyDescription>
                        {hasActiveRequestFilters
                          ? "Ajusta la búsqueda o limpia los filtros para volver a todas las solicitudes activas."
                          : "Las reservas históricas siguen alimentando métricas, pero este proveedor no tiene solicitudes activas para responder."}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </CardContent>
              <CardFooter className="grid gap-3 sm:flex sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  SLA recomendado: responder solicitudes nuevas en menos de 10
                  min.
                </p>
                <Link
                  href={providerProfileHref}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "w-full sm:w-auto"
                  )}
                >
                  Ver perfil
                  <ArrowUpRightIcon data-icon="inline-end" />
                </Link>
              </CardFooter>
            </Card>

            {provider && requests.length ? (
              <AdminPagination
                basePath="/provider"
                end={requestEnd}
                page={currentRequestPage}
                pageSize={PROVIDER_REQUEST_PAGE_LIMIT}
                params={{
                  filter: requestFilter,
                  page: String(currentRequestPage),
                  q: requestQuery,
                }}
                start={requestStart}
                totalItems={filteredRequestBookings.length}
                totalPages={requestTotalPages}
              />
            ) : null}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agenda de hoy</CardTitle>
              <CardDescription>
                {agenda.length} reservas activas para operar sin cambiar de
                pantalla.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agenda.length ? (
                <div className="max-h-[32rem] overflow-y-auto rounded-xl border border-border/75">
                  {agenda.map((slot, index) => (
                    <div
                      key={slot.id}
                      className={cn(
                        "grid gap-3 bg-background p-4 sm:grid-cols-[5rem_minmax(0,1fr)_auto]",
                        index !== agenda.length - 1 && "border-b"
                      )}
                    >
                      <div className="flex items-center gap-2 font-heading font-semibold text-primary">
                        <Clock3Icon className="size-4" />
                        {slot.time}
                      </div>
                      <div className="min-w-0">
                        <p className="break-anywhere font-medium">
                          {slot.client}
                        </p>
                        <p className="break-anywhere text-sm text-muted-foreground">
                          {slot.service}
                        </p>
                        {slot.serviceCount && slot.serviceCount > 1 ? (
                          <Badge variant="secondary" className="mt-2 w-fit">
                            {slot.serviceCount} servicios
                          </Badge>
                        ) : null}
                      </div>
                      <Badge
                        className="w-fit bg-[#e7f7f3] text-[#087466]"
                        variant="outline"
                      >
                        {slot.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty className="border border-border/70 bg-background/70">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CalendarDaysIcon />
                    </EmptyMedia>
                    <EmptyTitle>Agenda libre hoy</EmptyTitle>
                    <EmptyDescription>
                      No hay reservas activas para este proveedor en el tablero
                      actual.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <Card id="perfil">
            <CardHeader>
              <CardTitle>Salud del perfil</CardTitle>
              <CardDescription>
                Completa lo que aumenta confianza y conversión.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {profileHealth.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/80 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full",
                        item.complete
                          ? "bg-[#e7f7f3] text-[#087466]"
                          : "bg-[#fff3d7] text-[#7a5200]"
                      )}
                    >
                      {item.complete ? (
                        <CheckCircle2Icon className="size-4" />
                      ) : (
                        <Clock3Icon className="size-4" />
                      )}
                    </div>
                    <p className="break-anywhere line-clamp-2 text-sm font-medium">
                      {item.label}
                    </p>
                  </div>
                  <span className="break-anywhere shrink-0 text-right text-xs font-semibold text-muted-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </CardContent>
            <CardFooter className="grid gap-2 sm:flex sm:flex-wrap">
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                Editar servicios
              </Button>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                Horarios
              </Button>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                Portafolio
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disponibilidad Firebase</CardTitle>
              <CardDescription>
                Resumen compacto de provider-slots.
              </CardDescription>
              <CardAction>
                <Badge variant="outline">
                  {providerSlotSummary?.totalDays ?? 0} días
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              {providerSlotSummary ? (
                <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["Disponibles", providerSlotSummary.availableSlots],
                      ["Descanso", providerSlotSummary.restSlots],
                      ["Bloqueados", providerSlotSummary.blockedSlots],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-border/70 bg-background/80 p-3"
                      >
                        <p className="font-heading text-lg font-semibold">
                          {value}
                        </p>
                        <p className="break-anywhere text-[0.7rem] text-muted-foreground">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {providerSlotSummary.nextTimes.length ? (
                    <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-primary">
                            Próximos cupos
                          </p>
                          <p className="break-anywhere text-xs text-muted-foreground">
                            {providerSlotSummary.nextDateLabel ||
                              providerSlotSummary.nextDate}
                          </p>
                        </div>
                        <Badge className="bg-[#e7f7f3] text-[#087466]">
                          {providerSlotSummary.nextTimes.length} visibles
                        </Badge>
                      </div>
                      <div className="mt-3 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
                        {providerSlotSummary.nextTimes.map((time) => (
                          <Badge key={time} variant="outline">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Empty className="border border-border/70 bg-background/70">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Clock3Icon />
                        </EmptyMedia>
                        <EmptyTitle>Sin cupos próximos</EmptyTitle>
                        <EmptyDescription>
                          Hay días cargados, pero no hay horarios disponibles
                          futuros para este proveedor.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>
              ) : (
                <Empty className="border border-border/70 bg-background/70">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CalendarDaysIcon />
                    </EmptyMedia>
                    <EmptyTitle>Sin horarios cargados</EmptyTitle>
                    <EmptyDescription>
                      Cuando Firebase tenga provider-slots para este proveedor,
                      aparecerán aquí como resumen compacto.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calidad Firebase</CardTitle>
              <CardDescription>
                Resumen de punctuality_evalution.
              </CardDescription>
              <CardAction>
                <Badge variant="outline">
                  {providerQualitySummary?.total ?? 0} eval.
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              {providerQualitySummary ? (
                <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["Puntual", providerQualitySummary.onTime],
                      ["Tarde", providerQualitySummary.late],
                      ["Sin resp.", providerQualitySummary.unknown],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-border/70 bg-background/80 p-3"
                      >
                        <p className="font-heading text-lg font-semibold">
                          {value}
                        </p>
                        <p className="break-anywhere text-[0.7rem] text-muted-foreground">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-primary">
                          Puntualidad
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Señales históricas del proveedor
                        </p>
                      </div>
                      <Badge className="bg-[#e7f7f3] text-[#087466]">
                        {providerQualitySummary.onTimeRate}%
                      </Badge>
                    </div>
                  </div>

                  <div className="grid max-h-56 gap-2 overflow-y-auto pr-1">
                    {providerQualitySummary.recentEvaluations.map(
                      (evaluation) => (
                        <div
                          key={evaluation.id}
                          className="rounded-xl border border-border/70 bg-background/80 p-3 text-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="break-anywhere font-medium">
                                {evaluation.service}
                              </p>
                              <p className="break-anywhere text-xs text-muted-foreground">
                                {evaluation.customerName} ·{" "}
                                {evaluation.createdAt}
                              </p>
                            </div>
                            <Badge
                              className={punctualityClassName(
                                evaluation.wasPunctual
                              )}
                              variant="outline"
                            >
                              {punctualityLabel(evaluation.wasPunctual)}
                            </Badge>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <Empty className="border border-border/70 bg-background/70">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <GaugeIcon />
                    </EmptyMedia>
                    <EmptyTitle>Sin evaluaciones de puntualidad</EmptyTitle>
                    <EmptyDescription>
                      Cuando Firebase tenga punctuality_evalution para este
                      proveedor, aparecerán aquí como señales de calidad.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Servicios que convierten</CardTitle>
              <CardDescription>
                Rendimiento visible como dashboard.
              </CardDescription>
              <CardAction>
                <Badge variant="outline">{services.length} servicios</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex max-h-[32rem] flex-col gap-3 overflow-y-auto pr-3">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="rounded-xl border border-border/70 bg-background/80 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-anywhere font-medium">
                        {service.name}
                      </p>
                      <p className="break-anywhere text-xs text-muted-foreground">
                        {service.bookings}
                      </p>
                    </div>
                    <Badge variant="outline">{service.trend}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ingresos</span>
                    <span className="font-semibold">{service.revenue}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Actividad reciente</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {activity.map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-1 size-2 rounded-full bg-primary" />
                  <p className="text-sm text-muted-foreground">{item}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Badge variant="outline">
                <UserRoundCheckIcon data-icon="inline-start" />
                Operación sana
              </Badge>
              <Badge variant="outline">
                <BadgeCheckIcon data-icon="inline-start" />
                Verificada
              </Badge>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </PrototypeShell>
  )
}
