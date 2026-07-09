"use client"

import { useState } from "react"
import {
  BanIcon,
  CheckCircle2Icon,
  FileCheck2Icon,
  FileTextIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  UserRoundIcon,
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type AdminActionKind =
  | "approve"
  | "reject"
  | "suspend"
  | "reactivate"
  | "docs"
  | "view"

export type AdminActionEntity = {
  id: string
  title: string
  subtitle?: string
  badges?: string[]
  details: Array<[string, string | number]>
}

type AdminActionDialogProps = {
  kind: AdminActionKind
  entity: AdminActionEntity
  triggerClassName?: string
  triggerLabel?: string
  triggerSize?: "sm" | "lg"
  triggerVariant?: "default" | "outline" | "ghost"
}

const actionCopy: Record<
  AdminActionKind,
  {
    action?: string
    done: string
    label: string
    title: string
    description: string
    doneDescription: string
  }
> = {
  approve: {
    action: "Confirmar aprobación",
    done: "Aprobación preparada",
    label: "Aprobar",
    title: "Aprobar registro",
    description:
      "Revisa los datos clave antes de habilitar este perfil en producción.",
    doneDescription:
      "En Firebase esta acción actualizará el estado, guardará el auditor y habilitará el perfil para clientes.",
  },
  reject: {
    action: "Confirmar rechazo",
    done: "Rechazo preparado",
    label: "Rechazar",
    title: "Rechazar registro",
    description:
      "Agrega un motivo claro para que soporte pueda explicar el rechazo.",
    doneDescription:
      "En Firebase esta acción guardará el motivo, cambiará el estado y notificará al proveedor.",
  },
  suspend: {
    action: "Confirmar suspensión",
    done: "Suspensión preparada",
    label: "Suspender",
    title: "Suspender cuenta",
    description:
      "Deja registro del motivo antes de retirar temporalmente el acceso.",
    doneDescription:
      "En Firebase esta acción actualizará permisos, ocultará superficies públicas cuando aplique y guardará auditoría.",
  },
  reactivate: {
    action: "Confirmar reactivación",
    done: "Reactivación preparada",
    label: "Reactivar",
    title: "Reactivar cuenta",
    description:
      "Confirma que esta cuenta puede volver a operar en la plataforma.",
    doneDescription:
      "En Firebase esta acción restaurará permisos y registrará el cambio de estado.",
  },
  docs: {
    action: "Marcar docs revisados",
    done: "Documentos revisados",
    label: "Ver docs",
    title: "Documentos de verificación",
    description:
      "Comprueba que la información requerida está lista antes de aprobar.",
    doneDescription:
      "En Firebase esta acción guardará la revisión documental y dejará trazabilidad del admin.",
  },
  view: {
    done: "Vista cerrada",
    label: "Ver",
    title: "Detalle de cuenta",
    description:
      "Resumen compacto con datos largos preparados para revisión móvil.",
    doneDescription: "No se realizan cambios desde esta vista.",
  },
}

function actionIcon(kind: AdminActionKind) {
  if (kind === "approve") return <ShieldCheckIcon data-icon="inline-start" />
  if (kind === "reject") return <BanIcon data-icon="inline-start" />
  if (kind === "suspend") return <BanIcon data-icon="inline-start" />
  if (kind === "reactivate") return <RotateCcwIcon data-icon="inline-start" />
  if (kind === "docs") return <FileTextIcon data-icon="inline-start" />
  return <UserRoundIcon data-icon="inline-start" />
}

function EntitySummary({ entity }: { entity: AdminActionEntity }) {
  return (
    <div className="grid gap-3 rounded-xl border bg-muted/35 p-3 text-sm">
      <div className="min-w-0">
        <p className="break-anywhere font-semibold">{entity.title}</p>
        {entity.subtitle ? (
          <p className="break-anywhere text-muted-foreground">
            {entity.subtitle}
          </p>
        ) : null}
      </div>
      {entity.badges?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {entity.badges.map((badge) => (
            <Badge key={badge} variant="outline">
              {badge}
            </Badge>
          ))}
        </div>
      ) : null}
      <div className="grid gap-2">
        {entity.details.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-1 rounded-lg border bg-background/80 p-2 min-[420px]:grid-cols-[7rem_minmax(0,1fr)]"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
            <span className="break-anywhere text-sm font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActionFields({
  kind,
  entity,
}: {
  kind: AdminActionKind
  entity: AdminActionEntity
}) {
  if (kind === "view") return null

  if (kind === "docs") {
    return (
      <div className="grid gap-3">
        {[
          ["Identidad", "Lista para revisión"],
          ["Servicios", "Cruzar contra catálogo publicado"],
          ["Ubicación", "Validar zona de operación"],
        ].map(([label, detail]) => (
          <div
            key={label}
            className="flex items-start gap-3 rounded-xl border bg-background p-3"
          >
            <FileCheck2Icon className="mt-0.5 size-4 text-primary" />
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

  if (kind === "reject" || kind === "suspend") {
    return (
      <div className="grid gap-2">
        <Label htmlFor={`${kind}-${entity.id}`}>Motivo administrativo</Label>
        <Textarea
          id={`${kind}-${entity.id}`}
          rows={3}
          placeholder="Ej. falta información, documento inconsistente, actividad fuera de política..."
        />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-sm text-muted-foreground">
      Esta confirmación queda lista para conectarse al write path de Firebase
      sin cambiar la estructura visual.
    </div>
  )
}

export function AdminActionDialog({
  kind,
  entity,
  triggerClassName,
  triggerLabel,
  triggerSize = "sm",
  triggerVariant,
}: AdminActionDialogProps) {
  const copy = actionCopy[kind]
  const [submitted, setSubmitted] = useState(false)
  const variant =
    triggerVariant ??
    (kind === "approve" || kind === "reactivate" ? "default" : "outline")

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
            variant={variant}
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
            <div className="grid gap-4">
              <EntitySummary entity={entity} />
              <ActionFields kind={kind} entity={entity} />
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <DialogClose
                render={
                  <Button variant="outline" className="w-full sm:flex-1" />
                }
              >
                {kind === "view" ? "Cerrar" : "Cancelar"}
              </DialogClose>
              {copy.action ? (
                <Button
                  className="w-full sm:flex-1"
                  onClick={() => setSubmitted(true)}
                >
                  {copy.action}
                </Button>
              ) : null}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
