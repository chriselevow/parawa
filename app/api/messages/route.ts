import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

import {
  createFirebaseDocument,
  firebaseReference,
  hasFirebaseReadConfig,
} from "@/lib/firebase-readonly"
import { getActiveSession } from "@/lib/session"

type MessagePayload = {
  attachmentKind?: unknown
  attachmentLabel?: unknown
  bookingId?: unknown
  providerId?: unknown
  providerName?: unknown
  text?: unknown
  threadId?: unknown
  type?: unknown
}

const MESSAGE_ID_PREFIX = "web-message"
const allowedTypes = new Set(["text", "attachment"])

function text(value: unknown, fallback = "") {
  if (typeof value === "string") return value.trim() || fallback
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return fallback
}

function messageType(value: unknown) {
  const normalized = text(value, "text").toLowerCase()
  return allowedTypes.has(normalized) ? normalized : "text"
}

export async function POST(request: Request) {
  let body: MessagePayload

  try {
    body = (await request.json()) as MessagePayload
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida para enviar mensaje." },
      { status: 400 }
    )
  }

  const type = messageType(body.type)
  const threadId = text(body.threadId)
  const providerId = text(body.providerId)
  const providerName = text(body.providerName, "Proveedor Parawa")
  const bookingId = text(body.bookingId)
  const attachmentKind = text(body.attachmentKind)
  const attachmentLabel = text(body.attachmentLabel)
  const content = text(body.text)

  if (!threadId || !providerId) {
    return NextResponse.json(
      { error: "Hilo y proveedor son obligatorios." },
      { status: 400 }
    )
  }

  if (type === "text" && !content) {
    return NextResponse.json(
      { error: "Escribe un mensaje antes de enviarlo." },
      { status: 400 }
    )
  }

  if (type === "attachment" && !attachmentKind) {
    return NextResponse.json(
      { error: "Selecciona un tipo de adjunto válido." },
      { status: 400 }
    )
  }

  if (content.length > 2000) {
    return NextResponse.json(
      { error: "El mensaje debe tener 2000 caracteres o menos." },
      { status: 400 }
    )
  }

  const session = await getActiveSession()

  if (session.role !== "client" || !session.userId) {
    return NextResponse.json(
      {
        error: "Entra como cliente para enviar mensajes.",
        loginHref: `/login?role=client&next=${encodeURIComponent(
          `/messages/${threadId}`
        )}`,
      },
      { status: 401 }
    )
  }

  const messageId = `${MESSAGE_ID_PREFIX}-${randomUUID()}`

  if (session.source !== "firebase") {
    return NextResponse.json(
      {
        message:
          type === "attachment"
            ? "Adjunto demo preparado. Entra con Firebase para guardar el mensaje y subir el archivo real."
            : "Mensaje demo enviado. Entra con Firebase para guardarlo en Firestore.",
        messageId,
        persisted: false,
      },
      { status: 202 }
    )
  }

  if (!hasFirebaseReadConfig()) {
    return NextResponse.json(
      {
        error:
          "Falta configurar la cuenta de servicio de Firebase para guardar mensajes.",
      },
      { status: 503 }
    )
  }

  const now = new Date()
  const created = await createFirebaseDocument(
    "messages",
    {
      attachment:
        type === "attachment"
          ? {
              kind: attachmentKind,
              label: attachmentLabel || attachmentKind,
              storagePath: "",
            }
          : undefined,
      booking: bookingId ? firebaseReference("bookings", bookingId) : undefined,
      body:
        content ||
        (type === "attachment"
          ? `Adjunto: ${attachmentLabel || attachmentKind}`
          : ""),
      createdAt: now,
      customer: firebaseReference("users", session.userId),
      provider: firebaseReference("users", providerId),
      read: false,
      sender: firebaseReference("users", session.userId),
      senderRole: session.role,
      source: "parawa-web",
      threadId,
      type,
      updatedAt: now,
    },
    { documentId: messageId }
  )

  return NextResponse.json({
    message: `Mensaje guardado en Firestore para ${providerName}.`,
    messageId: created?.id ?? messageId,
    persisted: true,
  })
}
