import Link from "next/link"
import { notFound } from "next/navigation"

import {
  MessageThreadDemo,
  type DemoMessage,
} from "@/components/message-thread-demo"
import { PrototypeShell } from "@/components/prototype-shell"
import { buttonVariants } from "@/components/ui/button"
import {
  getBooking,
  getBookingForClient,
  getMessageThreadsForClient,
  getProvider,
} from "@/lib/parawa-data"
import { getActiveSession } from "@/lib/session"
import { cn } from "@/lib/utils"

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await getActiveSession()
  const messageThreads = await getMessageThreadsForClient(userId)
  const thread = messageThreads.find((t) => t.id === id)
  const provider = await getProvider(id)
  if (!thread && !provider) notFound()

  const name = thread?.providerName ?? provider?.name ?? "Chat"
  const booking = thread?.bookingId
    ? userId
      ? await getBookingForClient(thread.bookingId, userId)
      : await getBooking(thread.bookingId)
    : undefined

  const messages: DemoMessage[] = [
    {
      from: "system",
      text: booking
        ? `Reserva ${booking.code} vinculada a este chat.`
        : "Chat iniciado desde el perfil del proveedor.",
    },
    { from: "them", text: "Hola, ¿qué servicio necesitas?", time: "2:14 PM" },
    {
      from: "me",
      text: booking
        ? `Hola, escribo por la reserva de ${booking.service}.`
        : "Hola, quisiera consultar disponibilidad.",
      time: "2:16 PM",
      status: "read",
    },
    {
      from: "them",
      text: thread?.preview ?? "Perfecto, tengo espacio a las 3pm.",
      time: "2:18 PM",
    },
  ]

  return (
    <PrototypeShell active="/messages">
      <Link
        href="/messages"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "self-start"
        )}
      >
        ← Mensajes
      </Link>

      <MessageThreadDemo
        name={name}
        initialMessages={messages}
        booking={booking}
        providerHref={provider ? `/providers/${provider.id}` : undefined}
      />

      {provider && (
        <Link
          href={`/providers/${provider.id}`}
          className={cn(buttonVariants({ variant: "outline" }), "self-start")}
        >
          Ver perfil del proveedor
        </Link>
      )}
    </PrototypeShell>
  )
}
