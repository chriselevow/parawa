import { cache } from "react"

import {
  adminStats as mockAdminStats,
  adminUsers as mockAdminUsers,
  pendingVerifications as mockPendingVerifications,
  recentAdminBookings as mockRecentAdminBookings,
  type AdminBookingRow,
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
type FirebaseMessage = Record<string, unknown>
type FirebaseSlot = Record<string, unknown>
type FirebaseEnterprise = Record<string, unknown>
type FirebasePunctualityEvaluation = Record<string, unknown>

export type ServiceSummary = {
  id: string
  providerId: string
  providerName: string
  title: string
  description: string
  category: string
  subCategory: string
  price: number
  duration: string
  imageUrl?: string
  pricingMode: string
  servicesLimit: number
  isPackage: boolean
  productsCount: number
  productsPreview: string
  ratePerDistanceUnit: boolean
}

export type EnterpriseSummary = {
  id: string
  name: string
  description: string
  imageUrl?: string
  ownerId: string
  ownerName: string
  updatedAt: string
}

export type PunctualityValue = "yes" | "no" | "unknown"

export type PunctualityEvaluationSummary = {
  id: string
  providerId: string
  providerName: string
  customerId: string
  customerName: string
  bookingId: string
  service: string
  serviceNames: string[]
  serviceCount: number
  wasPunctual: PunctualityValue
  createdAt: string
}

export type ReviewSummary = {
  id: string
  providerId: string
  providerName: string
  customerId: string
  customerName: string
  bookingId: string
  service: string
  serviceNames: string[]
  serviceCount: number
  score: number
  comment: string
  anon: boolean
  wasPunctual: PunctualityValue
  createdAt: string
}

export type ThreadMessageSummary = {
  id: string
  from: "me" | "them" | "system"
  text: string
  time: string
  status?: "sent" | "read"
  delivery: "firebase"
  messageId: string
}

export type ProviderQualitySummary = {
  providerId: string
  total: number
  onTime: number
  late: number
  unknown: number
  onTimeRate: number
  recentEvaluations: PunctualityEvaluationSummary[]
}

export type ProviderSlotSummary = {
  providerId: string
  totalDays: number
  totalSlots: number
  availableSlots: number
  restSlots: number
  blockedSlots: number
  nextDate: string
  nextDateLabel: string
  nextTimes: string[]
}

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
  providerSlotSummaries: ProviderSlotSummary[]
  serviceSummaries: ServiceSummary[]
  enterpriseSummaries: EnterpriseSummary[]
  punctualityEvaluations: PunctualityEvaluationSummary[]
  reviewSummaries: ReviewSummary[]
  providerQualitySummaries: ProviderQualitySummary[]
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
  const services = unique(value.map((item) => serviceTitle(item, serviceById)))

  return services.length ? services : ["Servicio Parawa"]
}

function summarizeServices(services: string[]) {
  const serviceNames = services.length ? services : ["Servicio Parawa"]
  const serviceCount = serviceNames.length
  const service =
    serviceCount > 2
      ? `${serviceNames[0]}, ${serviceNames[1]} +${serviceCount - 2} servicios`
      : serviceNames.join(", ")

  return { service, serviceCount, serviceNames }
}

function subCategoryLabel(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return categoryLabel(value)
  }

  const record = value as Record<string, unknown>
  return categoryLabel(record.value)
}

function productsPreview(value: unknown) {
  if (!Array.isArray(value) || !value.length) return ""

  return value
    .map((product) => {
      if (!product || typeof product !== "object") return ""
      const record = product as Record<string, unknown>
      const name = text(record.name, text(record.title))
      const quantity = number(record.quantity, 0)
      if (!name) return ""
      return quantity > 1 ? `${name} x${quantity}` : name
    })
    .filter(Boolean)
    .join(", ")
}

function slotItems(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((slot) => (slot && typeof slot === "object" ? slot : null))
    .filter(Boolean) as Record<string, unknown>[]
}

function normalizePunctualityValue(value: unknown): PunctualityValue {
  const raw = text(value).toLowerCase()
  if (raw === "yes" || raw === "true" || raw === "puntual") return "yes"
  if (raw === "no" || raw === "false" || raw === "tarde") return "no"
  return "unknown"
}

function normalizeSlotSummaries(slots: FirebaseDocument<FirebaseSlot>[]) {
  const byProvider = new Map<string, FirebaseDocument<FirebaseSlot>[]>()

  for (const slot of slots) {
    const providerId = text(slot.data.providerId) || docId(slot.data.provider)
    if (!providerId) continue
    byProvider.set(providerId, [...(byProvider.get(providerId) ?? []), slot])
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from(byProvider.entries()).map(([providerId, providerSlots]) => {
    const sortedSlots = [...providerSlots].sort((a, b) => {
      const aDate = toDate(a.data.date) ?? toDate(a.data.dateStr)
      const bDate = toDate(b.data.date) ?? toDate(b.data.dateStr)
      return (aDate?.getTime() ?? 0) - (bDate?.getTime() ?? 0)
    })
    let totalSlots = 0
    let availableSlots = 0
    let restSlots = 0
    let nextDate = ""
    let nextDateLabel = ""
    let nextTimes: string[] = []

    for (const slotDoc of sortedSlots) {
      const items = slotItems(slotDoc.data.slots)
      totalSlots += items.length
      availableSlots += items.filter((item) => bool(item.isAvailable)).length
      restSlots += items.filter((item) => bool(item.isRestTime)).length

      if (nextTimes.length) continue

      const date = toDate(slotDoc.data.date) ?? toDate(slotDoc.data.dateStr)
      if (date && date < today) continue

      const availableTimes = items
        .filter((item) => bool(item.isAvailable) && !bool(item.isRestTime))
        .map((item) => text(item.value))
        .filter(Boolean)

      if (!availableTimes.length) continue

      nextDate = text(slotDoc.data.dateStr) || formatShortDate(date, "")
      nextDateLabel = formatShortDate(date, nextDate)
      nextTimes = availableTimes.slice(0, 8)
    }

    return {
      providerId,
      totalDays: sortedSlots.length,
      totalSlots,
      availableSlots,
      restSlots,
      blockedSlots: Math.max(totalSlots - availableSlots - restSlots, 0),
      nextDate,
      nextDateLabel,
      nextTimes,
    } satisfies ProviderSlotSummary
  })
}

function normalizeServiceSummaries(
  services: FirebaseDocument<FirebaseService>[],
  userById: Map<string, FirebaseDocument<FirebaseUser>>
) {
  return services
    .map((service) => {
      const providerId = docId(service.data.provider)
      const products = Array.isArray(service.data.products)
        ? service.data.products
        : []
      const title =
        text(service.data.title) ||
        text(service.data.name) ||
        `Servicio ${service.id.slice(0, 6)}`

      return {
        id: service.id,
        providerId,
        providerName: providerId
          ? fullName(userById.get(providerId))
          : "Proveedor no vinculado",
        title,
        description:
          profileCopy(service.data.description) || "Sin descripción publicada.",
        category: categoryLabel(service.data.category),
        subCategory: subCategoryLabel(service.data.subCategory),
        price: number(service.data.price, 0),
        duration: text(service.data.duration, "Sin duración"),
        imageUrl:
          storageUrl(service.data.image) ||
          storageUrl(
            Array.isArray(service.data.images)
              ? service.data.images[0]
              : undefined
          ),
        pricingMode: text(service.data.pricingMode, "standard"),
        servicesLimit: number(service.data.servicesLimit, 0),
        isPackage: bool(service.data.isPackage),
        productsCount: products.length,
        productsPreview: productsPreview(products),
        ratePerDistanceUnit: bool(service.data.ratePerDistanceUnit),
      } satisfies ServiceSummary
    })
    .sort(
      (a, b) =>
        a.providerName.localeCompare(b.providerName, "es") ||
        a.title.localeCompare(b.title, "es")
    )
}

function normalizeEnterpriseSummaries(
  enterprises: FirebaseDocument<FirebaseEnterprise>[],
  userById: Map<string, FirebaseDocument<FirebaseUser>>
) {
  return enterprises
    .map((enterprise) => {
      const ownerId = docId(enterprise.data.owner)
      const date =
        toDate(enterprise.data.updatedAt) ?? toDate(enterprise.data.createdAt)

      return {
        id: enterprise.id,
        name: text(
          enterprise.data.name,
          `Empresa ${enterprise.id.slice(0, 6)}`
        ),
        description:
          profileCopy(enterprise.data.description) ||
          "Sin descripción publicada.",
        imageUrl: storageUrl(enterprise.data.img_url),
        ownerId,
        ownerName: ownerId
          ? fullName(userById.get(ownerId))
          : "Sin propietario asignado",
        updatedAt: formatDateTime(date, "Sin fecha"),
      } satisfies EnterpriseSummary
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
}

function normalizePunctualityEvaluations(
  evaluations: FirebaseDocument<FirebasePunctualityEvaluation>[],
  userById: Map<string, FirebaseDocument<FirebaseUser>>,
  serviceById: Map<string, FirebaseDocument<FirebaseService>>
) {
  return evaluations
    .map((evaluation) => {
      const providerId = docId(evaluation.data.provider)
      const customerId = docId(evaluation.data.customer)
      const createdAt = toDate(evaluation.data.createdAt)
      const serviceSummary = summarizeServices(
        bookingServices(evaluation.data.services, serviceById)
      )

      return {
        id: evaluation.id,
        providerId,
        providerName: fullName(userById.get(providerId)),
        customerId,
        customerName: fullName(userById.get(customerId)),
        bookingId: docId(evaluation.data.booking),
        service: serviceSummary.service,
        serviceNames: serviceSummary.serviceNames,
        serviceCount: serviceSummary.serviceCount,
        wasPunctual: normalizePunctualityValue(evaluation.data.wasPunctual),
        createdAt: formatDateTime(createdAt, "Sin fecha"),
        sortAt: createdAt?.getTime() ?? 0,
      }
    })
    .sort((a, b) => b.sortAt - a.sortAt)
    .map(
      (evaluation) =>
        ({
          id: evaluation.id,
          providerId: evaluation.providerId,
          providerName: evaluation.providerName,
          customerId: evaluation.customerId,
          customerName: evaluation.customerName,
          bookingId: evaluation.bookingId,
          service: evaluation.service,
          serviceNames: evaluation.serviceNames,
          serviceCount: evaluation.serviceCount,
          wasPunctual: evaluation.wasPunctual,
          createdAt: evaluation.createdAt,
        }) satisfies PunctualityEvaluationSummary
    )
}

function normalizeReviewSummaries(
  reviews: FirebaseDocument<FirebaseReview>[],
  userById: Map<string, FirebaseDocument<FirebaseUser>>,
  serviceById: Map<string, FirebaseDocument<FirebaseService>>
) {
  return reviews
    .map((review) => {
      const providerId = docId(review.data.provider)
      const customerId = docId(review.data.customer)
      const createdAt = toDate(review.data.createdAt)
      const serviceValues = Array.isArray(review.data.services)
        ? review.data.services
        : [
            review.data.service,
            review.data.serviceId,
            review.data.serviceRef,
          ].filter(Boolean)
      const serviceSummary = summarizeServices(
        bookingServices(serviceValues, serviceById)
      )
      const score = Math.max(0, Math.min(number(review.data.score, 0), 5))

      return {
        id: review.id,
        providerId,
        providerName: fullName(userById.get(providerId)),
        customerId,
        customerName: fullName(userById.get(customerId)),
        bookingId: docId(review.data.booking),
        service: serviceSummary.service,
        serviceNames: serviceSummary.serviceNames,
        serviceCount: serviceSummary.serviceCount,
        score,
        comment:
          profileCopy(review.data.comment) || "Sin comentario publicado.",
        anon: bool(review.data.anon),
        wasPunctual: normalizePunctualityValue(review.data.wasPunctual),
        createdAt: formatDateTime(createdAt, "Sin fecha"),
        sortAt: createdAt?.getTime() ?? 0,
      }
    })
    .sort((a, b) => b.sortAt - a.sortAt)
    .map(
      (review) =>
        ({
          id: review.id,
          providerId: review.providerId,
          providerName: review.providerName,
          customerId: review.customerId,
          customerName: review.customerName,
          bookingId: review.bookingId,
          service: review.service,
          serviceNames: review.serviceNames,
          serviceCount: review.serviceCount,
          score: review.score,
          comment: review.comment,
          anon: review.anon,
          wasPunctual: review.wasPunctual,
          createdAt: review.createdAt,
        }) satisfies ReviewSummary
    )
}

function normalizeProviderQualitySummaries(
  evaluations: PunctualityEvaluationSummary[]
) {
  const byProvider = evaluations.reduce((summaries, evaluation) => {
    if (!evaluation.providerId) return summaries

    const current =
      summaries.get(evaluation.providerId) ??
      ({
        providerId: evaluation.providerId,
        total: 0,
        onTime: 0,
        late: 0,
        unknown: 0,
        onTimeRate: 0,
        recentEvaluations: [],
      } satisfies ProviderQualitySummary)

    current.total += 1
    if (evaluation.wasPunctual === "yes") current.onTime += 1
    else if (evaluation.wasPunctual === "no") current.late += 1
    else current.unknown += 1
    current.recentEvaluations = [...current.recentEvaluations, evaluation]

    summaries.set(evaluation.providerId, current)
    return summaries
  }, new Map<string, ProviderQualitySummary>())

  return Array.from(byProvider.values())
    .map((summary) => ({
      ...summary,
      onTimeRate: summary.total
        ? Math.round((summary.onTime / summary.total) * 100)
        : 0,
      recentEvaluations: summary.recentEvaluations.slice(0, 6),
    }))
    .sort((a, b) => b.total - a.total)
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
          serviceNames: booking.serviceNames,
          serviceCount: booking.serviceCount,
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
  slots: FirebaseDocument<FirebaseSlot>[],
  enterprises: FirebaseDocument<FirebaseEnterprise>[],
  punctualityDocs: FirebaseDocument<FirebasePunctualityEvaluation>[]
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
    )

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
      const serviceSummary = summarizeServices(
        bookingServices(booking.data.services, serviceById)
      )
      const status = normalizeStatus(booking.data.status)
      const startAt = toDate(booking.data.startAt)
      const shortDate = formatShortDate(startAt, text(booking.data.startDate))
      const time = formatTime(startAt, text(booking.data.startTime))
      const service = serviceSummary.service
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
        serviceNames: serviceSummary.serviceNames,
        serviceCount: serviceSummary.serviceCount,
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
      serviceNames: booking.serviceNames,
      serviceCount: booking.serviceCount,
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
  const providerSlotSummaries = normalizeSlotSummaries(slots)
  const serviceSummaries = normalizeServiceSummaries(services, userById)
  const enterpriseSummaries = normalizeEnterpriseSummaries(
    enterprises,
    userById
  )
  const punctualityEvaluations = normalizePunctualityEvaluations(
    punctualityDocs,
    userById,
    serviceById
  )
  const reviewSummaries = normalizeReviewSummaries(
    reviews,
    userById,
    serviceById
  )
  const providerQualitySummaries = normalizeProviderQualitySummaries(
    punctualityEvaluations
  )

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
    providerSlotSummaries,
    serviceSummaries,
    enterpriseSummaries,
    punctualityEvaluations,
    reviewSummaries,
    providerQualitySummaries,
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
    providerSlotSummaries: [],
    serviceSummaries: [],
    enterpriseSummaries: [],
    punctualityEvaluations: [],
    reviewSummaries: [],
    providerQualitySummaries: [],
  }
}

async function loadFirebaseData() {
  if (!hasFirebaseReadConfig()) return null

  try {
    const [
      users,
      services,
      bookings,
      reviews,
      slots,
      enterprises,
      punctualityDocs,
    ] = await Promise.all([
      listFirebaseCollection<FirebaseUser>("users"),
      listFirebaseCollection<FirebaseService>("services"),
      listFirebaseCollection<FirebaseBooking>("bookings"),
      listFirebaseCollection<FirebaseReview>("reviews"),
      listFirebaseCollection<FirebaseSlot>("provider-slots"),
      listFirebaseCollection<FirebaseEnterprise>("enterprise"),
      listFirebaseCollection<FirebasePunctualityEvaluation>(
        "punctuality_evalution"
      ),
    ])

    if (
      !users ||
      !services ||
      !bookings ||
      !reviews ||
      !slots ||
      !enterprises ||
      !punctualityDocs
    ) {
      return null
    }

    return normalizeFirebaseData(
      users,
      services,
      bookings,
      reviews,
      slots,
      enterprises,
      punctualityDocs
    )
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
  const slotDaysByProvider = data.providerSlotSummaries.reduce(
    (counts, summary) => {
      counts.set(summary.providerId, summary.totalDays)
      return counts
    },
    new Map<string, number>()
  )
  const providerScore = (provider: Provider) =>
    (providerBookings.get(provider.id) ?? 0) * 4 +
    (slotDaysByProvider.get(provider.id) ?? 0)

  if (providerId) {
    const sessionProvider = data.providers.find(
      (provider) => provider.id === providerId
    )
    if (sessionProvider) return sessionProvider
  }

  return data.providers.reduce<Provider | undefined>((current, candidate) => {
    if (!current) return candidate
    return providerScore(candidate) > providerScore(current)
      ? candidate
      : current
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

export async function getMessagesForThread(
  threadId?: string,
  clientId?: string,
  providerId?: string
) {
  if (!hasFirebaseReadConfig() || !threadId || !clientId) return []

  let messages: FirebaseDocument<FirebaseMessage>[] | null = null

  try {
    messages = await listFirebaseCollection<FirebaseMessage>("messages", {
      maxDocs: 500,
      pageSize: 100,
    })
  } catch {
    return []
  }

  const normalizedMessages: (ThreadMessageSummary & { sortAt: number })[] = []

  for (const message of messages ?? []) {
    const messageThreadId = text(message.data.threadId)
    const messageProviderId = docId(message.data.provider)
    const customerId = docId(message.data.customer)
    const senderId = docId(message.data.sender)

    if (messageThreadId !== threadId) continue
    if (providerId && messageProviderId && messageProviderId !== providerId) {
      continue
    }
    if (customerId && customerId !== clientId && senderId !== clientId) {
      continue
    }

    const createdAt = toDate(message.data.createdAt)
    const attachment =
      message.data.attachment &&
      typeof message.data.attachment === "object" &&
      !Array.isArray(message.data.attachment)
        ? (message.data.attachment as Record<string, unknown>)
        : null
    const attachmentLabel = text(attachment?.label, text(attachment?.kind))
    const body =
      text(message.data.body) ||
      (attachmentLabel ? `Adjunto: ${attachmentLabel}` : "Mensaje")

    normalizedMessages.push({
      delivery: "firebase",
      from: senderId === clientId ? "me" : "them",
      id: message.id,
      messageId: message.id,
      status: senderId === clientId ? "sent" : undefined,
      text: body,
      time: formatTime(createdAt, "Firebase"),
      sortAt: createdAt?.getTime() ?? 0,
    })
  }

  return normalizedMessages
    .sort((a, b) => a.sortAt - b.sortAt)
    .slice(-50)
    .map((message) => ({
      delivery: message.delivery,
      from: message.from,
      id: message.id,
      messageId: message.messageId,
      status: message.status,
      text: message.text,
      time: message.time,
    }))
}

export async function getAdminData() {
  const data = await getParawaData()
  return {
    adminStats: data.adminStats,
    adminUsers: data.adminUsers,
    pendingVerifications: data.pendingVerifications,
    adminBookings: data.adminBookings,
    recentAdminBookings: data.recentAdminBookings,
    serviceSummaries: data.serviceSummaries,
    enterpriseSummaries: data.enterpriseSummaries,
    punctualityEvaluations: data.punctualityEvaluations,
    reviewSummaries: data.reviewSummaries,
    providerQualitySummaries: data.providerQualitySummaries,
  }
}

export async function getProviderSlotSummary(providerId?: string) {
  if (!providerId) return undefined
  const data = await getParawaData()
  return data.providerSlotSummaries.find(
    (summary) => summary.providerId === providerId
  )
}

export async function getProviderQualitySummary(providerId?: string) {
  if (!providerId) return undefined
  const data = await getParawaData()
  return data.providerQualitySummaries.find(
    (summary) => summary.providerId === providerId
  )
}

export async function getServicesForProvider(providerId?: string) {
  if (!providerId) return []
  const data = await getParawaData()
  return data.serviceSummaries.filter(
    (service) => service.providerId === providerId
  )
}

export async function getReviewsForProvider(providerId?: string) {
  if (!providerId) return []
  const data = await getParawaData()
  return data.reviewSummaries.filter(
    (review) => review.providerId === providerId
  )
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
  const slotDaysByProvider = data.providerSlotSummaries.reduce(
    (counts, summary) => {
      counts.set(summary.providerId, summary.totalDays)
      return counts
    },
    new Map<string, number>()
  )
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
    (a, b) =>
      (providerCounts.get(b.id) ?? 0) * 4 +
      (slotDaysByProvider.get(b.id) ?? 0) -
      ((providerCounts.get(a.id) ?? 0) * 4 +
        (slotDaysByProvider.get(a.id) ?? 0))
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
