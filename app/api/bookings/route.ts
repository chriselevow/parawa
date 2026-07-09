import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

import {
  createFirebaseDocument,
  firebaseReference,
  hasFirebaseReadConfig,
} from "@/lib/firebase-readonly"
import { getActiveSession } from "@/lib/session"

type BookingPayload = {
  address?: unknown
  date?: unknown
  notes?: unknown
  providerId?: unknown
  providerName?: unknown
  service?: {
    category?: unknown
    duration?: unknown
    id?: unknown
    price?: unknown
    title?: unknown
  }
  time?: unknown
}

const BOOKING_ID_PREFIX = "web"

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

function startDate(date: string, time: string) {
  const parsed = new Date(`${date}T${time}:00-05:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function bookingCode(id: string) {
  return `PAR-${id.slice(-5).toUpperCase()}`
}

export async function POST(request: Request) {
  let body: BookingPayload

  try {
    body = (await request.json()) as BookingPayload
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida para crear reserva." },
      { status: 400 }
    )
  }

  const session = await getActiveSession()
  const providerId = text(body.providerId)
  const providerName = text(body.providerName, "Proveedor Parawa")
  const serviceId = text(body.service?.id)
  const serviceTitle = text(body.service?.title)
  const date = text(body.date)
  const time = text(body.time)
  const scheduledAt = startDate(date, time)

  if (
    !providerId ||
    !serviceId ||
    !serviceTitle ||
    !date ||
    !time ||
    !scheduledAt
  ) {
    return NextResponse.json(
      { error: "Proveedor, servicio, fecha y hora son obligatorios." },
      { status: 400 }
    )
  }

  if (session.role !== "client" || !session.userId) {
    return NextResponse.json(
      {
        error: "Entra como cliente para crear una reserva.",
        loginHref: `/login?role=client&next=${encodeURIComponent(
          `/providers/${providerId}`
        )}`,
      },
      { status: 401 }
    )
  }

  const id = `${BOOKING_ID_PREFIX}-${randomUUID()}`
  const code = bookingCode(id)

  if (session.source !== "firebase") {
    return NextResponse.json(
      {
        bookingId: id,
        code,
        message:
          "Solicitud demo preparada. Entra con Firebase para guardarla en Firestore.",
        persisted: false,
      },
      { status: 202 }
    )
  }

  if (!hasFirebaseReadConfig()) {
    return NextResponse.json(
      {
        error:
          "Falta configurar la cuenta de servicio de Firebase para guardar reservas.",
      },
      { status: 503 }
    )
  }

  const now = new Date()
  const total = number(body.service?.price, 0)
  const created = await createFirebaseDocument(
    "bookings",
    {
      createdAt: now,
      customer: firebaseReference("users", session.userId),
      location: text(body.address),
      notes: text(body.notes),
      paid: false,
      provider: firebaseReference("users", providerId),
      serviceSnapshot: {
        category: text(body.service?.category),
        duration: text(body.service?.duration),
        price: total,
        title: serviceTitle,
      },
      services: [firebaseReference("services", serviceId)],
      source: "parawa-web",
      startAt: scheduledAt,
      status: "pending",
      subTotal: total,
      total,
      updatedAt: now,
    },
    { documentId: id }
  )

  return NextResponse.json({
    bookingId: created?.id ?? id,
    code: bookingCode(created?.id ?? id),
    message: `Reserva ${code} guardada en Firestore para ${providerName}.`,
    persisted: true,
  })
}
