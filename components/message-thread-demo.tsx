"use client"

import { FormEvent, useRef, useState } from "react"
import Link from "next/link"
import {
  CalendarDaysIcon,
  CreditCardIcon,
  MapPinIcon,
  PaperclipIcon,
  SendIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type Booking, statusLabel } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export type DemoMessage = {
  from: "me" | "them" | "system"
  text: string
  time?: string
  status?: "sent" | "read"
}

export function MessageThreadDemo({
  name,
  initialMessages,
  booking,
  providerHref,
}: {
  name: string
  initialMessages: DemoMessage[]
  booking?: Booking
  providerHref?: string
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return

    setMessages((current) => [
      ...current,
      { from: "me", text, time: "Ahora", status: "sent" },
      {
        from: "them",
        text: "Recibido. Te confirmo disponibilidad en unos minutos.",
        time: "Ahora",
      },
    ])
    setDraft("")
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  return (
    <div className="flex min-h-[34rem] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm shadow-primary/5">
      <div className="grid gap-3 border-b px-4 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        <Avatar className="size-11">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-medium">{name}</h1>
            <Badge className="bg-[#e7f7f3] text-[#087466]" variant="outline">
              Disponible
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Demo local · mensajes de esta sesión
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {booking ? (
            <Link
              href={`/bookings/${booking.id}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Ver reserva
            </Link>
          ) : null}
          {providerHref ? (
            <Link
              href={providerHref}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Ver perfil
            </Link>
          ) : null}
        </div>
      </div>

      {booking ? (
        <div className="border-b bg-secondary/35 px-4 py-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{statusLabel(booking.status)}</Badge>
                <p className="font-medium">{booking.service}</p>
                <span className="text-xs font-medium text-muted-foreground">
                  {booking.code}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDaysIcon className="size-3.5" />
                  {booking.shortDate} · {booking.time}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="size-3.5" />
                  {booking.serviceLocation}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CreditCardIcon className="size-3.5" />${booking.total}
                </span>
              </div>
            </div>
            <Link
              href={`/bookings/${booking.id}`}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Revisar detalle
            </Link>
          </div>
        </div>
      ) : null}

      <ScrollArea className="flex-1 bg-muted/20 p-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          <div className="self-center rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            Hoy
          </div>
          {messages.map((message, index) => (
            <div
              key={`${message.from}-${index}-${message.text}`}
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                message.from === "me"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : message.from === "system"
                    ? "self-center border bg-card text-muted-foreground"
                    : "bg-card"
              )}
            >
              {message.text}
              {message.time ? (
                <p
                  className={cn(
                    "mt-1 text-[0.7rem]",
                    message.from === "me"
                      ? "text-primary-foreground/75"
                      : "text-muted-foreground"
                  )}
                >
                  {message.time}
                  {message.status === "sent" ? " · Enviado" : ""}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t bg-card p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {[
            "Confirmo asistencia",
            "¿Puedes enviarme la dirección?",
            "Gracias",
          ].map((reply) => (
            <Button
              key={reply}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                setDraft(reply)
                requestAnimationFrame(() => inputRef.current?.focus())
              }}
            >
              {reply}
            </Button>
          ))}
        </div>
        <form className="flex gap-2" onSubmit={sendMessage}>
          <Button type="button" variant="outline" size="icon">
            <PaperclipIcon />
            <span className="sr-only">Adjuntar archivo</span>
          </Button>
          <Input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Escribe un mensaje..."
            aria-label="Mensaje"
            className="h-9"
          />
          <Button type="submit" disabled={!draft.trim()}>
            <SendIcon data-icon="inline-start" />
            Enviar
          </Button>
        </form>
      </div>
    </div>
  )
}
