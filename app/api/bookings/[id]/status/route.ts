import { NextResponse } from "next/server"

import {
  firebaseReference,
  hasFirebaseReadConfig,
  updateFirebaseDocument,
} from "@/lib/firebase-readonly"
import { getActiveSession } from "@/lib/session"

type BookingStatusPayload = {
  action?: unknown
  note?: unknown
  providerId?: unknown
  status?: unknown
}

const allowedStatuses = new Set(["accepted", "cancelled"])

function text(value: unknown, fallback = "") {
  if (typeof value === "string") return value.trim() || fallback
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return fallback
}

function statusCopy(status: string) {
  if (status === "accepted") return "aceptada"
  if (status === "cancelled") return "rechazada"
  return "actualizada"
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body: BookingStatusPayload

  try {
    body = (await request.json()) as BookingStatusPayload
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida para actualizar reserva." },
      { status: 400 }
    )
  }

  const bookingId = text(id)
  const providerId = text(body.providerId)
  const status = text(body.status)
  const action = text(body.action, status)
  const note = text(body.note)

  if (!bookingId || !allowedStatuses.has(status)) {
    return NextResponse.json(
      { error: "Reserva y estado válido son obligatorios." },
      { status: 400 }
    )
  }

  const session = await getActiveSession()

  if (
    (session.role !== "provider" && session.role !== "admin") ||
    !session.userId
  ) {
    return NextResponse.json(
      { error: "Entra como proveedor para actualizar esta reserva." },
      { status: 401 }
    )
  }

  if (
    session.role === "provider" &&
    providerId &&
    providerId !== session.userId
  ) {
    return NextResponse.json(
      { error: "Esta reserva pertenece a otro proveedor." },
      { status: 403 }
    )
  }

  if (session.source !== "firebase") {
    return NextResponse.json(
      {
        bookingId,
        message: `Reserva ${statusCopy(status)} en demo. Entra con Firebase para guardar el cambio en Firestore.`,
        persisted: false,
        status,
      },
      { status: 202 }
    )
  }

  if (!hasFirebaseReadConfig()) {
    return NextResponse.json(
      {
        error:
          "Falta configurar la cuenta de servicio de Firebase para actualizar reservas.",
      },
      { status: 503 }
    )
  }

  const now = new Date()
  await updateFirebaseDocument("bookings", bookingId, {
    providerAction: {
      action,
      actor: firebaseReference("users", session.userId),
      at: now,
      note,
      status,
    },
    rejectionReason: status === "cancelled" ? note : undefined,
    status,
    updatedAt: now,
  })

  return NextResponse.json({
    bookingId,
    message: `Reserva ${statusCopy(status)} y guardada en Firestore.`,
    persisted: true,
    status,
  })
}
