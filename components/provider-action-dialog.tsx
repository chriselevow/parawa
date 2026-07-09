"use client"

import { useMemo, useState } from "react"
import {
  BadgeCheckIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  Clock3Icon,
  ImageIcon,
  MessageCircleIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type ProviderActionRequest = {
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

type ProviderActionKind =
  | "accept"
  | "reject"
  | "chat"
  | "availability"
  | "services"
  | "portfolio"
  | "sort"

type ProviderActionDialogProps = {
  kind: ProviderActionKind
  request?: ProviderActionRequest
  providerName?: string
  triggerClassName?: string
  triggerLabel?: string
  triggerSize?: "sm" | "lg"
  triggerVariant?: "default" | "outline" | "ghost"
  disabled?: boolean
}

const actionCopy: Record<
  ProviderActionKind,
  {
    action: string
    done: string
    label: string
    title: string
    description: string
    doneDescription: string
  }
> = {
  accept: {
    action: "Aceptar solicitud",
    done: "Solicitud aceptada",
    label: "Aceptar",
    title: "Aceptar solicitud",
    description:
      "Confirma la reserva y deja preparada la notificación al cliente.",
    doneDescription:
      "En Firebase esta acción actualizará la reserva, bloqueará el horario y notificará al cliente.",
  },
  reject: {
    action: "Rechazar solicitud",
    done: "Solicitud rechazada",
    label: "Rechazar",
    title: "Rechazar solicitud",
    description:
      "Agrega un motivo breve para que soporte y cliente entiendan el cierre.",
    doneDescription:
      "En Firebase esta acción guardará el motivo, actualizará el estado y liberará el horario.",
  },
  chat: {
    action: "Preparar respuesta",
    done: "Respuesta preparada",
    label: "Chat",
    title: "Responder chat",
    description:
      "Escribe una respuesta rápida con el contexto de la solicitud abierta.",
    doneDescription:
      "En Firebase esta respuesta se escribirá en el hilo real y actualizará los no leídos.",
  },
  availability: {
    action: "Guardar disponibilidad",
    done: "Disponibilidad preparada",
    label: "Editar disponibilidad",
    title: "Editar disponibilidad",
    description:
      "Revisa cómo se verá el flujo para publicar cupos sin salir del panel.",
    doneDescription:
      "En Firebase esto escribirá provider-slots y refrescará los próximos cupos del perfil.",
  },
  services: {
    action: "Guardar servicios",
    done: "Servicios preparados",
    label: "Editar servicios",
    title: "Editar servicios",
    description:
      "Ajusta la presentación del catálogo para que servicios largos sigan siendo manejables.",
    doneDescription:
      "En Firebase esto actualizará servicios, precios y metadatos visibles en el perfil público.",
  },
  portfolio: {
    action: "Guardar portafolio",
    done: "Portafolio preparado",
    label: "Portafolio",
    title: "Actualizar portafolio",
    description:
      "Organiza fotos y piezas destacadas antes de conectar cargas a Storage.",
    doneDescription:
      "En Firebase esto subirá imágenes a Storage y guardará las referencias del proveedor.",
  },
  sort: {
    action: "Aplicar orden recomendado",
    done: "Solicitudes ordenadas",
    label: "Autoordenar",
    title: "Autoordenar solicitudes",
    description:
      "Prepara una cola priorizada por estado, hora y probabilidad de conversión.",
    doneDescription:
      "En Firebase esto guardará preferencias de cola o aplicará el orden desde una consulta indexada.",
  },
}

function actionIcon(kind: ProviderActionKind) {
  if (kind === "accept") return <CheckCircle2Icon data-icon="inline-start" />
  if (kind === "reject") return <XIcon data-icon="inline-start" />
  if (kind === "chat") return <MessageCircleIcon data-icon="inline-start" />
  if (kind === "availability")
    return <CalendarDaysIcon data-icon="inline-start" />
  if (kind === "portfolio") return <ImageIcon data-icon="inline-start" />
  if (kind === "sort") return <SparklesIcon data-icon="inline-start" />
  return <BadgeCheckIcon data-icon="inline-start" />
}

function RequestSummary({ request }: { request: ProviderActionRequest }) {
  return (
    <div className="grid gap-3 rounded-xl border bg-muted/35 p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-anywhere font-semibold">{request.client}</p>
          <p className="break-anywhere text-muted-foreground">
            {request.service} · {request.when}
          </p>
        </div>
        <Badge>{request.amount}</Badge>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline">{request.status}</Badge>
        <Badge variant="secondary">{request.distance}</Badge>
        {request.serviceCount && request.serviceCount > 1 ? (
          <Badge variant="outline">{request.serviceCount} servicios</Badge>
        ) : null}
      </div>
      <p className="break-anywhere rounded-lg border bg-background/75 p-2 text-xs text-muted-foreground">
        {request.note}
      </p>
    </div>
  )
}

function ActionBody({
  kind,
  providerName,
  request,
}: {
  kind: ProviderActionKind
  providerName?: string
  request?: ProviderActionRequest
}) {
  const quickReplies = useMemo(
    () => [
      "Confirmo disponibilidad para esa hora.",
      "¿Puedes enviarme una referencia de dirección?",
      "Te aviso apenas termine la cita anterior.",
    ],
    []
  )
  const [reply, setReply] = useState(quickReplies[0])

  if (request && (kind === "accept" || kind === "reject" || kind === "chat")) {
    return (
      <div className="grid gap-4">
        <RequestSummary request={request} />
        {kind === "reject" ? (
          <div className="grid gap-2">
            <Label htmlFor={`reject-${request.id}`}>Motivo interno</Label>
            <Textarea
              id={`reject-${request.id}`}
              rows={3}
              placeholder="Ej. horario no disponible, cliente fuera de zona, falta información..."
            />
          </div>
        ) : null}
        {kind === "chat" ? (
          <div className="grid gap-3">
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {quickReplies.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto shrink-0 rounded-full px-3 py-2 text-xs"
                  onClick={() => setReply(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`reply-${request.id}`}>Respuesta</Label>
              <Textarea
                id={`reply-${request.id}`}
                rows={4}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
              />
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  if (kind === "availability") {
    return (
      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {["Hoy", "Mañana", "Sábado"].map((day) => (
            <div key={day} className="rounded-xl border bg-background p-3">
              <p className="font-semibold">{day}</p>
              <p className="text-xs text-muted-foreground">3 cupos activos</p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Desde
            </span>
            <Input defaultValue="09:00" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Hasta
            </span>
            <Input defaultValue="18:00" />
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["09:00", "11:00", "14:00", "16:30", "18:00"].map((slot) => (
            <Badge key={slot} variant="outline">
              {slot}
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  if (kind === "services") {
    return (
      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Servicio destacado
            </span>
            <Input defaultValue="Servicio principal" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Precio desde
            </span>
            <Input defaultValue="$35" />
          </label>
        </div>
        <div className="rounded-xl border bg-muted/35 p-3">
          <p className="text-sm font-semibold">
            Catálogo de {providerName ?? "proveedor"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Mantén nombres, precios y paquetes compactos para que el perfil siga
            usable en móvil.
          </p>
        </div>
      </div>
    )
  }

  if (kind === "portfolio") {
    return (
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-2">
          {["Principal", "Antes", "Después"].map((label) => (
            <div
              key={label}
              className="grid aspect-square place-items-center rounded-xl border bg-muted/35 text-center text-xs text-muted-foreground"
            >
              <div>
                <ImageIcon className="mx-auto mb-2 size-5" />
                {label}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border bg-background p-3 text-sm text-muted-foreground">
          Las imágenes usan espacios estables para evitar saltos de layout
          cuando Firebase Storage entregue archivos altos o anchos.
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {[
        ["Nuevas primero", "Solicitudes pendientes con horario cercano."],
        ["Pago listo", "Reservas con mayor probabilidad de conversión."],
        ["Contexto faltante", "Casos que conviene responder por chat."],
      ].map(([label, detail]) => (
        <div
          key={label}
          className="flex items-start gap-3 rounded-xl border bg-background p-3"
        >
          <Clock3Icon className="mt-0.5 size-4 text-primary" />
          <div className="min-w-0">
            <p className="font-medium">{label}</p>
            <p className="break-anywhere text-xs text-muted-foreground">
              {detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProviderActionDialog({
  kind,
  request,
  providerName,
  triggerClassName,
  triggerLabel,
  triggerSize = "sm",
  triggerVariant = "outline",
  disabled = false,
}: ProviderActionDialogProps) {
  const copy = actionCopy[kind]
  const [submitted, setSubmitted] = useState(false)

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) setSubmitted(false)
      }}
    >
      <DialogTrigger
        render={
          <Button
            size={triggerSize}
            variant={triggerVariant}
            disabled={disabled}
            className={cn("w-full sm:w-auto", triggerClassName)}
          />
        }
      >
        {actionIcon(kind)}
        {triggerLabel ?? copy.label}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {submitted ? (
          <>
            <DialogHeader>
              <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-[#e7f7f3] text-[#087466]">
                <CheckCircle2Icon />
              </div>
              <DialogTitle>{copy.done}</DialogTitle>
              <DialogDescription>{copy.doneDescription}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button className="w-full sm:flex-1" />}>
                Listo
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="break-anywhere">{copy.title}</DialogTitle>
              <DialogDescription>{copy.description}</DialogDescription>
            </DialogHeader>
            <ActionBody
              kind={kind}
              providerName={providerName}
              request={request}
            />
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <DialogClose
                render={
                  <Button variant="outline" className="w-full sm:flex-1" />
                }
              >
                Cancelar
              </DialogClose>
              <Button
                className="w-full sm:flex-1"
                onClick={() => setSubmitted(true)}
              >
                {copy.action}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
