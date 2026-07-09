import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

import {
  createFirebaseDocument,
  firebaseReference,
  hasFirebaseReadConfig,
} from "@/lib/firebase-readonly"
import { getActiveSession } from "@/lib/session"

type ReviewPayload = {
  anon?: unknown
  bookingId?: unknown
  comment?: unknown
  providerId?: unknown
  providerName?: unknown
  score?: unknown
  service?: unknown
  serviceNames?: unknown
  wasPunctual?: unknown
}

const REVIEW_ID_PREFIX = "web-review"

function text(value: unknown, fallback = "") {
  if (typeof value === "string") return value.trim() || fallback
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return fallback
}

function bool(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (["true", "yes", "si", "sí", "1"].includes(normalized)) return true
    if (["false", "no", "0"].includes(normalized)) return false
  }
  return fallback
}

function rating(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

function punctuality(value: unknown) {
  const raw = text(value).toLowerCase()
  if (raw === "yes" || raw === "no") return raw
  return "unknown"
}

function reviewServices(value: unknown, fallbackService: string) {
  const services = Array.isArray(value)
    ? value.map((item) => text(item)).filter(Boolean)
    : []

  if (services.length) return [...new Set(services)]
  return fallbackService ? [fallbackService] : []
}

export async function POST(request: Request) {
  let body: ReviewPayload

  try {
    body = (await request.json()) as ReviewPayload
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida para crear reseña." },
      { status: 400 }
    )
  }

  const bookingId = text(body.bookingId)
  const providerId = text(body.providerId)
  const providerName = text(body.providerName, "Proveedor Parawa")
  const service = text(body.service, "Servicio Parawa")
  const score = Math.round(rating(body.score))
  const comment = text(body.comment)
  const serviceNames = reviewServices(body.serviceNames, service)

  if (!bookingId || !providerId || score < 1 || score > 5) {
    return NextResponse.json(
      { error: "Reserva, proveedor y puntuación válida son obligatorios." },
      { status: 400 }
    )
  }

  if (comment.length < 8) {
    return NextResponse.json(
      { error: "Agrega un comentario de al menos 8 caracteres." },
      { status: 400 }
    )
  }

  const session = await getActiveSession()

  if (session.role !== "client" || !session.userId) {
    return NextResponse.json(
      {
        error: "Entra como cliente para publicar una reseña.",
        loginHref: `/login?role=client&next=${encodeURIComponent(
          `/bookings/${bookingId}`
        )}`,
      },
      { status: 401 }
    )
  }

  const reviewId = `${REVIEW_ID_PREFIX}-${randomUUID()}`

  if (session.source !== "firebase") {
    return NextResponse.json(
      {
        message:
          "Reseña demo preparada. Entra con Firebase para guardarla en Firestore.",
        persisted: false,
        reviewId,
      },
      { status: 202 }
    )
  }

  if (!hasFirebaseReadConfig()) {
    return NextResponse.json(
      {
        error:
          "Falta configurar la cuenta de servicio de Firebase para guardar reseñas.",
      },
      { status: 503 }
    )
  }

  const now = new Date()
  const created = await createFirebaseDocument(
    "reviews",
    {
      anon: bool(body.anon),
      booking: firebaseReference("bookings", bookingId),
      comment,
      createdAt: now,
      customer: firebaseReference("users", session.userId),
      provider: firebaseReference("users", providerId),
      score,
      service,
      services: serviceNames,
      source: "parawa-web",
      updatedAt: now,
      wasPunctual: punctuality(body.wasPunctual),
    },
    { documentId: reviewId }
  )

  return NextResponse.json({
    message: `Reseña guardada en Firestore para ${providerName}.`,
    persisted: true,
    reviewId: created?.id ?? reviewId,
  })
}
