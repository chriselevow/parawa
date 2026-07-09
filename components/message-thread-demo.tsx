"use client"

import { FormEvent, useRef, useState } from "react"
import Link from "next/link"
import {
  AlertCircleIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronUpIcon,
  CreditCardIcon,
  FileTextIcon,
  ImageIcon,
  Loader2Icon,
  MapPinIcon,
  PaperclipIcon,
  SendIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type Booking, statusLabel } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export type DemoMessage = {
  from: "me" | "them" | "system"
  text: string
  time?: string
  status?: "sent" | "read"
  delivery?: "demo" | "firebase"
  messageId?: string
}

type MessageResult = {
  error?: string
  loginHref?: string
  message?: string
  messageId?: string
  persisted?: boolean
}

const MESSAGE_THREAD_PAGE_SIZE = 8
const attachmentOptions = [
  {
    id: "photo",
    label: "Foto",
    detail: "Antes/después, referencia visual o comprobante.",
    icon: ImageIcon,
  },
  {
    id: "document",
    label: "Documento",
    detail: "PDF, permiso, instrucciones o factura.",
    icon: FileTextIcon,
  },
  {
    id: "receipt",
    label: "Comprobante",
    detail: "Pago, depósito o confirmación externa.",
    icon: PaperclipIcon,
  },
]

export function MessageThreadDemo({
  bookingId,
  name,
  initialMessages,
  booking,
  providerId,
  providerHref,
  providerName,
  threadId,
}: {
  bookingId?: string
  name: string
  initialMessages: DemoMessage[]
  booking?: Booking
  providerId: string
  providerHref?: string
  providerName: string
  threadId: string
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [visibleMessageCount, setVisibleMessageCount] = useState(() =>
    Math.min(MESSAGE_THREAD_PAGE_SIZE, initialMessages.length)
  )
  const [draft, setDraft] = useState("")
  const [sendError, setSendError] = useState<MessageResult | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isAttaching, setIsAttaching] = useState(false)
  const [attachmentOpen, setAttachmentOpen] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState(
    attachmentOptions[0].id
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
  const visibleCount = Math.min(visibleMessageCount, messages.length)
  const hiddenMessageCount = Math.max(messages.length - visibleCount, 0)
  const visibleMessages = messages.slice(hiddenMessageCount)

  function messageFromResult(text: string, result: MessageResult): DemoMessage {
    return {
      delivery: result.persisted ? "firebase" : "demo",
      from: "me",
      messageId: result.messageId,
      status: "sent",
      text,
      time: "Ahora",
    }
  }

  async function postMessage(payload: {
    attachmentKind?: string
    attachmentLabel?: string
    text?: string
    type: "text" | "attachment"
  }) {
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...payload,
        bookingId,
        providerId,
        providerName,
        threadId,
      }),
    })
    const json = (await response.json().catch(() => ({}))) as MessageResult

    if (!response.ok) {
      throw json
    }

    return json
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return

    setIsSending(true)
    setSendError(null)

    try {
      const result = await postMessage({ text, type: "text" })
      const nextMessages: DemoMessage[] = [messageFromResult(text, result)]

      if (!result.persisted) {
        nextMessages.push({
          from: "them",
          text: "Recibido. Te confirmo disponibilidad en unos minutos.",
          time: "Ahora",
        })
      }

      setMessages((current) => [...current, ...nextMessages])
      setVisibleMessageCount((count) => count + nextMessages.length)
      setDraft("")
      requestAnimationFrame(() => inputRef.current?.focus())
    } catch (error) {
      setSendError(
        typeof error === "object" && error
          ? (error as MessageResult)
          : { error: "No se pudo enviar el mensaje." }
      )
    } finally {
      setIsSending(false)
    }
  }

  async function addAttachmentMessage() {
    const option =
      attachmentOptions.find(
        (attachment) => attachment.id === selectedAttachment
      ) ?? attachmentOptions[0]

    setIsAttaching(true)
    setSendError(null)

    try {
      const result = await postMessage({
        attachmentKind: option.id,
        attachmentLabel: option.label,
        text: `Adjunto preparado: ${option.label}.`,
        type: "attachment",
      })
      const nextMessage = messageFromResult(
        `Adjunto preparado: ${option.label}. ${
          result.persisted
            ? "Metadatos guardados en Firestore; falta conectar Storage para el archivo real."
            : "Entra con Firebase para guardar el mensaje y subir el archivo real."
        }`,
        result
      )

      setMessages((current) => [...current, nextMessage])
      setVisibleMessageCount((count) => count + 1)
      setAttachmentOpen(false)
      requestAnimationFrame(() => inputRef.current?.focus())
    } catch (error) {
      setSendError(
        typeof error === "object" && error
          ? (error as MessageResult)
          : { error: "No se pudo preparar el adjunto." }
      )
    } finally {
      setIsAttaching(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100svh-13rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm shadow-primary/5 sm:min-h-[34rem]">
      <div className="grid gap-3 border-b px-4 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        <Avatar className="size-11 shrink-0">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="break-anywhere font-medium">{name}</h1>
            <Badge className="bg-[#e7f7f3] text-[#087466]" variant="outline">
              Disponible
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {messages.length} mensajes · Firebase-ready
          </p>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
          {booking ? (
            <Link
              href={`/bookings/${booking.id}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full sm:w-auto"
              )}
            >
              Ver reserva
            </Link>
          ) : null}
          {providerHref ? (
            <Link
              href={providerHref}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-full sm:w-auto"
              )}
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
                <p className="break-anywhere font-medium">{booking.service}</p>
                {booking.serviceCount && booking.serviceCount > 1 ? (
                  <Badge variant="secondary">
                    {booking.serviceCount} servicios
                  </Badge>
                ) : null}
                <span className="break-anywhere text-xs font-medium text-muted-foreground">
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
              className={cn(buttonVariants({ size: "sm" }), "w-full lg:w-auto")}
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
          {hiddenMessageCount > 0 ? (
            <div className="self-center rounded-2xl border bg-card/95 p-2 shadow-sm">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto rounded-xl px-3 py-2 text-xs"
                onClick={() =>
                  setVisibleMessageCount((count) =>
                    Math.min(count + MESSAGE_THREAD_PAGE_SIZE, messages.length)
                  )
                }
              >
                <ChevronUpIcon data-icon="inline-start" />
                Cargar {Math.min(
                  hiddenMessageCount,
                  MESSAGE_THREAD_PAGE_SIZE
                )}{" "}
                anteriores
              </Button>
              <p className="px-3 pb-1 text-center text-[0.68rem] text-muted-foreground">
                {visibleCount} de {messages.length} visibles
              </p>
            </div>
          ) : null}
          {visibleMessages.map((message, index) => (
            <div
              key={`${message.from}-${hiddenMessageCount + index}-${message.text}`}
              className={cn(
                "break-anywhere max-w-[92%] rounded-2xl px-3 py-2 text-sm shadow-sm sm:max-w-[85%]",
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
                  {message.delivery === "firebase" ? " · Firestore" : ""}
                  {message.delivery === "demo" ? " · Demo" : ""}
                </p>
              ) : null}
              {message.messageId ? (
                <p
                  className={cn(
                    "break-anywhere mt-1 text-[0.65rem]",
                    message.from === "me"
                      ? "text-primary-foreground/65"
                      : "text-muted-foreground"
                  )}
                >
                  ID: {message.messageId}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t bg-card p-3">
        <div className="mb-2 flex max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
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
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={sendMessage}
        >
          <Dialog open={attachmentOpen} onOpenChange={setAttachmentOpen}>
            <DialogTrigger
              render={<Button type="button" variant="outline" size="icon" />}
            >
              <PaperclipIcon />
              <span className="sr-only">Adjuntar archivo</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Adjuntar archivo</DialogTitle>
                <DialogDescription>
                  Prepara un adjunto para este hilo. El flujo final conectará
                  Firebase Storage con el documento del mensaje.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  {attachmentOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = selectedAttachment === option.id

                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={isSelected}
                        className={cn(
                          "grid min-w-0 gap-2 rounded-xl border bg-background p-3 text-left text-sm transition-colors hover:border-primary/35 hover:bg-primary/5",
                          isSelected && "border-primary/50 bg-primary/10"
                        )}
                        onClick={() => setSelectedAttachment(option.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Icon className="size-4 text-primary" />
                          {isSelected ? (
                            <CheckCircle2Icon className="size-4 text-primary" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="break-anywhere font-medium">
                            {option.label}
                          </p>
                          <p className="break-anywhere mt-1 text-xs text-muted-foreground">
                            {option.detail}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-sm text-muted-foreground">
                  Esta acción guarda metadatos del adjunto en el hilo. La carga
                  binaria a Firebase Storage queda como el siguiente paso.
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <DialogClose
                  render={
                    <Button variant="outline" className="w-full sm:flex-1" />
                  }
                >
                  Cancelar
                </DialogClose>
                <Button
                  type="button"
                  className="w-full sm:flex-1"
                  disabled={isAttaching}
                  onClick={() => void addAttachmentMessage()}
                >
                  {isAttaching ? (
                    <>
                      <Loader2Icon
                        data-icon="inline-start"
                        className="animate-spin"
                      />
                      Adjuntando
                    </>
                  ) : (
                    "Adjuntar a conversación"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Escribe un mensaje..."
            aria-label="Mensaje"
            className="h-9"
          />
          <Button type="submit" disabled={!draft.trim() || isSending}>
            {isSending ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <SendIcon data-icon="inline-start" />
            )}
            {isSending ? "Enviando" : "Enviar"}
          </Button>
        </form>
        {sendError ? (
          <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircleIcon className="mt-0.5 size-4 text-destructive" />
              <div className="min-w-0">
                <p className="font-semibold text-destructive">
                  No se pudo enviar
                </p>
                <p className="break-anywhere mt-1 text-muted-foreground">
                  {sendError.error ?? "Revisa tu sesión e intenta nuevamente."}
                </p>
                {sendError.loginHref ? (
                  <Link
                    href={sendError.loginHref}
                    className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline"
                  >
                    Entrar como cliente
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
