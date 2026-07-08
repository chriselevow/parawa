import { cache } from "react"

import {
  adminStats as mockAdminStats,
  adminUsers as mockAdminUsers,
  pendingVerifications as mockPendingVerifications,
  recentAdminBookings as mockRecentAdminBookings,
  type AdminUser,
  type PendingVerification,
} from "@/lib/admin-mock-data"
import {
  bookings as mockBookings,
  categories as mockCategories,
  getBooking as getMockBooking,
  getBookingForProvider as getMockBookingForProvider,
  getProvider as getMockProvider,
  messageThreads as mockMessageThreads,
  providers as mockProviders,
  type Booking,
  type BookingStatus,
  type BookingTimelineItem,
  type MessageThread,
  type PaymentStatus,
  type Provider,
} from "@/lib/mock-data"
import {
  hasFirebaseReadConfig,
  listFirebaseCollection,
  type FirebaseDocument,
} from "@/lib/firebase-readonly"

type FirebaseUser = Record<string, unknown>
type FirebaseService = Record<string, unknown>
type FirebaseBooking = Record<string, unknown>
type FirebaseReview = Record<string, unknown>
type FirebaseSlot = Record<string, unknown>

type AdminBookingRow = (typeof mockRecentAdminBookings)[number]

export type ParawaDataSource = "firebase" | "mock"

export type ParawaData = {
  source: ParawaDataSource
  providers: Provider[]
  categories: string[]
  bookings: Booking[]
  messageThreads: MessageThread[]
  adminStats: typeof mockAdminStats
  adminUsers: AdminUser[]
  pendingVerifications: PendingVerification[]
  adminBookings: AdminBookingRow[]
  recentAdminBookings: AdminBookingRow[]
}

export type SessionIdentityOption = {
  id: string
  label: string
  detail?: string
}

const categoryLabels: Record<string, string> = {
  beauty: "Belleza",
  carServices: "Autos",
  cleaning: "Limpieza",
  events: "Eventos",
  fitness: "Fitness",
  handyman: "Reparaciones",
  health: "Salud",
  hobbies: "Hobbies",
  home: "Hogar",
  language: "Idiomas",
  learning: "Educación",
  massage: "Masajes",
  media: "Media",
  music: "Música",
  pets: "Mascotas",
  tech: "Técnico",
  transportation: "Transporte",
  wellness: "Bienestar",
}

function text(value: unknown, fallback = "") {
  if (typeof value === "string") return value.trim() || fallback
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return fallback
}

function number(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""))
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function bool(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true
    if (value.toLowerCase() === "false") return false
  }
  return fallback
}

function docId(value: unknown) {
  const raw = text(value)
  if (!raw) return ""
  return raw.split("/").filter(Boolean).pop() ?? raw
}

function fullName(user: FirebaseDocument<FirebaseUser> | undefined) {
  if (!user) return "Usuario Parawa"
  const name =
    [text(user.data.name), text(user.data.lastname)]
      .filter(Boolean)
      .join(" ") ||
    text(user.data.displayName) ||
    text(user.data.phoneNumber) ||
    `Usuario ${user.id.slice(0, 6)}`

  return name.toLowerCase() === "first last"
    ? `Usuario ${user.id.slice(0, 6)}`
    : name
}

function categoryLabel(value: unknown) {
  const key = text(value)
  if (!key) return "General"
  return categoryLabels[key] ?? key
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}

function toDate(value: unknown) {
  const raw = text(value)
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatShortDate(date: Date | null, fallback: string) {
  if (!date) return fallback
  return new Intl.DateTimeFormat("es-PA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date)
}

function formatTime(date: Date | null, fallback: string) {
  if (!date) return fallback
  return new Intl.DateTimeFormat("es-PA", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function formatDateTime(date: Date | null, fallback = "Fecha por confirmar") {
  if (!date) return fallback
  return `${formatShortDate(date, fallback)} · ${formatTime(date, "")}`
}

function storageUrl(value: unknown) {
  const raw = text(value)
  if (!raw) return undefined
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw

  const bucket =
    process.env.PARAWA_FIREBASE_STORAGE_BUCKET ??
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "mopi-af870.appspot.com"
  const path = raw.startsWith("gs://")
    ? raw.split("/").slice(3).join("/")
    : raw.replace(/^\/+/, "")

  if (!path) return undefined

  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
    path
  )}?alt=media`
}

function profileCopy(value: unknown) {
  const raw = text(value)
  if (!raw || raw === "noCancellationPolicy") return ""
  return raw
}

function serviceTitle(
  value: unknown,
  serviceById: Map<string, FirebaseDocument<FirebaseService>>
) {
  if (typeof value === "string") {
    const raw = text(value)
    const service = serviceById.get(docId(value))
    return (
      text(service?.data.title) ||
      text(service?.data.description) ||
      (raw.includes("/") ? "" : raw)
    )
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>
    return text(record.title) || text(record.name) || text(record.service)
  }

  return ""
}

function bookingServices(
  value: unknown,
  serviceById: Map<string, FirebaseDocument<FirebaseService>>
) {
  if (!Array.isArray(value)) return ["Servicio Parawa"]
  const services = unique(
    value.map((item) => serviceTitle(item, serviceById))
  ).slice(0, 4)

  return services.length ? services : ["Servicio Parawa"]
}

function normalizeStatus(value: unknown): BookingStatus {
  const status = text(value).toLowerCase()
  if (status === "completed") return "completed"
  if (status === "cancelled" || status === "declined") return "cancelled"
  if (status === "pending") return "pending"
  return "accepted"
}

function normalizePaymentStatus(
  paid: unknown,
  status: BookingStatus
): PaymentStatus {
  if (bool(paid)) return "paid"
  if (status === "accepted" || status === "completed") return "authorized"
  if (status === "cancelled") return "refunded"
  return "pending"
}

function timelineForBooking(booking: {
  service: string
  providerName: string
  status: BookingStatus
}): BookingTimelineItem[] {
  const acceptedState =
    booking.status === "pending"
      ? "current"
      : booking.status === "cancelled"
        ? "upcoming"
        : "done"
  const serviceState =
    booking.status === "completed"
      ? "done"
      : booking.status === "cancelled"
        ? "upcoming"
        : booking.status === "pending"
          ? "upcoming"
          : "current"

  return [
    {
      label: "Solicitud enviada",
      detail: `Solicitud creada para ${booking.service}.`,
      state: "done",
    },
    {
      label: "Proveedor confirma",
      detail:
        booking.status === "cancelled"
          ? "La solicitud fue cancelada o rechazada."
          : `${booking.providerName} revisa la solicitud.`,
      state: acceptedState,
    },
    {
      label: "Servicio programado",
      detail: "El servicio queda visible para cliente y proveedor.",
      state: serviceState,
    },
    {
      label: "Completar y reseñar",
      detail:
        booking.status === "completed"
          ? "Servicio cerrado; reseña disponible."
          : "Se habilita al cerrar el servicio.",
      state: booking.status === "completed" ? "current" : "upcoming",
    },
  ]
}

function messageThreadsForBookings(bookings: Booking[]) {
  return Array.from(
    bookings
      .reduce((threads, booking) => {
        const threadId = booking.providerId || booking.id
        if (threads.has(threadId)) return threads

        threads.set(threadId, {
          id: threadId,
          providerId: booking.providerId,
          providerName: booking.providerName,
          service: booking.service,
          bookingId: booking.id,
          bookingStatus: booking.status,
          timestamp: booking.createdAt,
          preview: `Chat vinculado a ${booking.code}.`,
          unread: booking.status === "pending",
        })

        return threads
      }, new Map<string, MessageThread>())
      .values()
  )
}

function normalizeFirebaseData(
  users: FirebaseDocument<FirebaseUser>[],
  services: FirebaseDocument<FirebaseService>[],
  bookings: FirebaseDocument<FirebaseBooking>[],
  reviews: FirebaseDocument<FirebaseReview>[],
  slots: FirebaseDocument<FirebaseSlot>[]
): ParawaData | null {
  const userById = new Map(users.map((user) => [user.id, user]))
  const serviceById = new Map(services.map((service) => [service.id, service]))
  const servicesByProvider = new Map<
    string,
    FirebaseDocument<FirebaseService>[]
  >()
  const reviewsByProvider = new Map<
    string,
    FirebaseDocument<FirebaseReview>[]
  >()

  for (const service of services) {
    const providerId = docId(service.data.provider)
    if (!providerId) continue
    servicesByProvider.set(providerId, [
      ...(servicesByProvider.get(providerId) ?? []),
      service,
    ])
  }

  for (const review of reviews) {
    const providerId = docId(review.data.provider)
    if (!providerId) continue
    reviewsByProvider.set(providerId, [
      ...(reviewsByProvider.get(providerId) ?? []),
      review,
    ])
  }

  const providerUsers = users.filter(
    (user) => text(user.data.role) === "provider"
  )
  const providers = providerUsers.map((user) => {
    const providerServices = servicesByProvider.get(user.id) ?? []
    const providerReviews = reviewsByProvider.get(user.id) ?? []
    const scores = providerReviews
      .map((review) => number(review.data.score, NaN))
      .filter(Number.isFinite)
    const rating = scores.length
      ? Math.round(
          (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10
        ) / 10
      : 4.8
    const servicePrices = providerServices
      .map((service) => number(service.data.price, NaN))
      .filter(Number.isFinite)
    const categories = unique([
      text(user.data.category) ? categoryLabel(user.data.category) : "",
      ...providerServices.map((service) =>
        categoryLabel(service.data.category)
      ),
    ])
    const category = categories[0] ?? "General"

    const providerServiceNames = unique(
      providerServices.map((service) =>
        text(service.data.title, text(service.data.description))
      )
    ).slice(0, 12)

    return {
      id: user.id,
      name: fullName(user),
      category,
      area: text(user.data.address, text(user.data.country, "Panamá")),
      rating,
      reviews: providerReviews.length,
      priceFrom: servicePrices.length
        ? Math.min(...servicePrices)
        : number(user.data.priceStartsFrom, 0),
      verified: providerServices.length > 0,
      bio:
        profileCopy(user.data.about) ||
        profileCopy(user.data.cancellationPolicy) ||
        "Proveedor registrado en Parawa.",
      imageUrl: storageUrl(user.data.profileImage),
      categories: categories.length ? categories : [category],
      services: providerServiceNames.length
        ? providerServiceNames
        : ["Servicio Parawa"],
    }
  })

  if (!providers.length) return null

  const normalizedBookings = bookings
    .map((booking) => {
      const providerId = docId(booking.data.provider)
      const customerId = docId(booking.data.customer)
      const providerName = fullName(userById.get(providerId))
      const services = bookingServices(booking.data.services, serviceById)
      const status = normalizeStatus(booking.data.status)
      const startAt = toDate(booking.data.startAt)
      const shortDate = formatShortDate(startAt, text(booking.data.startDate))
      const time = formatTime(startAt, text(booking.data.startTime))
      const service = services.join(", ")
      const total = number(booking.data.total, number(booking.data.subTotal, 0))
      const serviceLocation = text(booking.data.location)
        ? "A domicilio"
        : "En local"

      return {
        id: booking.id,
        code: `PAR-${booking.id.slice(-5).toUpperCase()}`,
        clientId: customerId,
        clientName: fullName(userById.get(customerId)),
        providerId,
        providerName,
        service,
        date: formatDateTime(startAt, `${shortDate} · ${time}`),
        shortDate: shortDate || "Por confirmar",
        time: time || "Por confirmar",
        duration: "60 min",
        status,
        paymentStatus: normalizePaymentStatus(booking.data.paid, status),
        paymentMethod: bool(booking.data.paid)
          ? "Pago registrado"
          : "Pago pendiente",
        serviceLocation: serviceLocation as Booking["serviceLocation"],
        address: text(booking.data.location, "Ubicación por confirmar"),
        notes: "Reserva importada desde Firebase.",
        createdAt: formatDateTime(
          toDate(booking.data.createdAt),
          "Creación no disponible"
        ),
        total,
        timeline: timelineForBooking({ service, providerName, status }),
      } satisfies Booking
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const categories = [
    "Todos",
    ...unique(
      providers.flatMap(
        (provider) => provider.categories ?? [provider.category]
      )
    ).sort((a, b) => a.localeCompare(b, "es")),
  ]

  const adminUsers: AdminUser[] = users.map((user) => ({
    id: user.id,
    name: fullName(user),
    email:
      text(user.data.email) ||
      text(user.data.phoneNumber) ||
      `${user.id.slice(0, 8)}@parawa.local`,
    role: text(user.data.role) === "provider" ? "provider" : "client",
    joined: formatShortDate(
      toDate(user.data.createdAt) ?? toDate(user.data.updatedAt),
      "Sin fecha"
    ),
    status: "active",
  }))

  const adminBookings: AdminBookingRow[] = normalizedBookings.map(
    (booking) => ({
      id: booking.code,
      client: booking.clientName,
      provider: booking.providerName,
      service: booking.service,
      amount: booking.total,
      status: booking.status,
    })
  )
  const recentAdminBookings = adminBookings.slice(0, 12)

  const pendingVerifications: PendingVerification[] = providers
    .filter((provider) => !provider.verified)
    .map((provider) => ({
      id: provider.id,
      name: provider.name,
      category: provider.category,
      submitted: "Pendiente",
      documents: "Perfil sin servicios publicados",
    }))

  const activeProviders = providers.filter(
    (provider) => provider.verified
  ).length
  const completedBookings = normalizedBookings.filter(
    (booking) => booking.status === "completed"
  )
  const messageThreads = messageThreadsForBookings(normalizedBookings)

  return {
    source: "firebase",
    providers,
    categories,
    bookings: normalizedBookings,
    messageThreads,
    adminStats: {
      totalUsers: users.length,
      activeProviders,
      bookingsThisWeek: normalizedBookings.length,
      revenueMonth: completedBookings.reduce(
        (sum, booking) => sum + booking.total,
        0
      ),
      pendingVerifications: pendingVerifications.length,
      openDisputes: normalizedBookings.filter(
        (booking) => booking.status === "cancelled"
      ).length,
    },
    adminUsers,
    pendingVerifications,
    adminBookings,
    recentAdminBookings,
  }
}

function mockData(): ParawaData {
  return {
    source: "mock",
    providers: mockProviders,
    categories: [...mockCategories],
    bookings: mockBookings,
    messageThreads: mockMessageThreads,
    adminStats: mockAdminStats,
    adminUsers: mockAdminUsers,
    pendingVerifications: mockPendingVerifications,
    adminBookings: mockRecentAdminBookings,
    recentAdminBookings: mockRecentAdminBookings,
  }
}

async function loadFirebaseData() {
  if (!hasFirebaseReadConfig()) return null

  try {
    const [users, services, bookings, reviews, slots] = await Promise.all([
      listFirebaseCollection<FirebaseUser>("users", { maxDocs: 250 }),
      listFirebaseCollection<FirebaseService>("services", { maxDocs: 500 }),
      listFirebaseCollection<FirebaseBooking>("bookings", { maxDocs: 500 }),
      listFirebaseCollection<FirebaseReview>("reviews", { maxDocs: 250 }),
      listFirebaseCollection<FirebaseSlot>("provider-slots", { maxDocs: 250 }),
    ])

    if (!users || !services || !bookings || !reviews || !slots) return null

    return normalizeFirebaseData(users, services, bookings, reviews, slots)
  } catch {
    return null
  }
}

export const getParawaData = cache(async (): Promise<ParawaData> => {
  return (await loadFirebaseData()) ?? mockData()
})

export async function getProviders() {
  return (await getParawaData()).providers
}

export async function getCategories() {
  return (await getParawaData()).categories
}

export async function getProvider(id: string) {
  const data = await getParawaData()
  return (
    data.providers.find((provider) => provider.id === id) ?? getMockProvider(id)
  )
}

export async function getProviderForSession(providerId?: string) {
  const data = await getParawaData()
  const providerBookings = data.bookings.reduce((counts, booking) => {
    counts.set(booking.providerId, (counts.get(booking.providerId) ?? 0) + 1)
    return counts
  }, new Map<string, number>())

  if (providerId) {
    const sessionProvider = data.providers.find(
      (provider) => provider.id === providerId
    )
    if (sessionProvider) return sessionProvider
  }

  return data.providers.reduce<Provider | undefined>((current, candidate) => {
    if (!current) return candidate
    const currentCount = providerBookings.get(current.id) ?? 0
    const candidateCount = providerBookings.get(candidate.id) ?? 0
    return candidateCount > currentCount ? candidate : current
  }, undefined)
}

export async function getBookings() {
  return (await getParawaData()).bookings
}

export async function getBookingsForClient(clientId?: string) {
  const bookings = await getBookings()
  if (!clientId) return bookings

  return bookings.filter((booking) => booking.clientId === clientId)
}

export async function getBooking(id: string) {
  const data = await getParawaData()
  return (
    data.bookings.find((booking) => booking.id === id) ?? getMockBooking(id)
  )
}

export async function getBookingForClient(id: string, clientId?: string) {
  const booking = await getBooking(id)
  if (!booking || !clientId) return booking

  return booking.clientId === clientId ? booking : undefined
}

export async function getBookingForProvider(providerId: string) {
  const data = await getParawaData()
  return (
    data.bookings.find((booking) => booking.providerId === providerId) ??
    getMockBookingForProvider(providerId)
  )
}

export async function getMessageThreads() {
  return (await getParawaData()).messageThreads
}

export async function getMessageThreadsForClient(clientId?: string) {
  const bookings = await getBookingsForClient(clientId)
  return messageThreadsForBookings(bookings)
}

export async function getAdminData() {
  const data = await getParawaData()
  return {
    adminStats: data.adminStats,
    adminUsers: data.adminUsers,
    pendingVerifications: data.pendingVerifications,
    adminBookings: data.adminBookings,
    recentAdminBookings: data.recentAdminBookings,
  }
}

export async function getSessionIdentityOptions(): Promise<{
  client?: SessionIdentityOption
  provider?: SessionIdentityOption
}> {
  const data = await getParawaData()
  const providerCounts = data.bookings.reduce((counts, booking) => {
    counts.set(booking.providerId, (counts.get(booking.providerId) ?? 0) + 1)
    return counts
  }, new Map<string, number>())
  const clientCounts = data.bookings.reduce((counts, booking) => {
    if (!booking.clientId) return counts
    const current = counts.get(booking.clientId) ?? {
      count: 0,
      label: booking.clientName,
    }
    counts.set(booking.clientId, {
      count: current.count + 1,
      label: booking.clientName || current.label,
    })
    return counts
  }, new Map<string, { count: number; label: string }>())

  const provider = [...data.providers].sort(
    (a, b) => (providerCounts.get(b.id) ?? 0) - (providerCounts.get(a.id) ?? 0)
  )[0]
  const client = [...clientCounts.entries()].sort(
    (a, b) => b[1].count - a[1].count
  )[0]

  return {
    client: client
      ? {
          id: client[0],
          label: client[1].label,
          detail: `${client[1].count} reservas`,
        }
      : undefined,
    provider: provider
      ? {
          id: provider.id,
          label: provider.name,
          detail: `${providerCounts.get(provider.id) ?? 0} reservas`,
        }
      : undefined,
  }
}
