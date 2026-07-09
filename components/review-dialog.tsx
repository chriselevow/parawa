"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  Loader2Icon,
  StarIcon,
} from "lucide-react"

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

type PunctualityValue = "yes" | "no" | "unknown"

type ReviewResult = {
  error?: string
  loginHref?: string
  message?: string
  persisted?: boolean
  reviewId?: string
}

const punctualityOptions: { label: string; value: PunctualityValue }[] = [
  { label: "Sí", value: "yes" },
  { label: "No", value: "no" },
  { label: "No aplica", value: "unknown" },
]

export function ReviewDialog({
  bookingId,
  providerId,
  providerName,
  service,
  serviceNames,
}: {
  bookingId: string
  providerId: string
  providerName: string
  service: string
  serviceNames?: string[]
}) {
  const [open, setOpen] = useState(false)
  const [score, setScore] = useState(5)
  const [comment, setComment] = useState("")
  const [wasPunctual, setWasPunctual] = useState<PunctualityValue>("yes")
  const [anon, setAnon] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [error, setError] = useState<ReviewResult | null>(null)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setScore(5)
      setComment("")
      setWasPunctual("yes")
      setAnon(false)
      setIsSubmitting(false)
      setResult(null)
      setError(null)
    }
  }

  async function submitReview() {
    const trimmedComment = comment.trim()
    if (trimmedComment.length < 8) {
      setError({ error: "Agrega un comentario de al menos 8 caracteres." })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          anon,
          bookingId,
          comment: trimmedComment,
          providerId,
          providerName,
          score,
          service,
          serviceNames,
          wasPunctual,
        }),
      })
      const json = (await response.json().catch(() => ({}))) as ReviewResult

      if (!response.ok) {
        setError({
          error: json.error ?? "No se pudo publicar la reseña.",
          loginHref: json.loginHref,
        })
        return
      }

      setResult(json)
    } catch {
      setError({
        error: "No se pudo contactar el servidor. Intenta nuevamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" variant="secondary" />}>
        Dejar reseña
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {result ? (
          <>
            <DialogHeader>
              <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-[#e7f7f3] text-[#087466]">
                <CheckCircle2Icon />
              </div>
              <DialogTitle>
                {result.persisted ? "Reseña guardada" : "Reseña preparada"}
              </DialogTitle>
              <DialogDescription>
                {result.message ??
                  "La reseña quedó lista para sincronizar con Firebase."}
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-xl border bg-background p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{score} de 5 estrellas</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-xs font-semibold",
                    result.persisted
                      ? "bg-[#e7f7f3] text-[#087466]"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {result.persisted ? "Firestore" : "Demo"}
                </span>
              </div>
              <p className="break-anywhere mt-2 text-muted-foreground">
                {service}
              </p>
              <p className="break-anywhere mt-2">{comment}</p>
              {result.reviewId ? (
                <p className="break-anywhere mt-3 text-xs text-muted-foreground">
                  ID: {result.reviewId}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <DialogClose render={<Button className="w-full sm:flex-1" />}>
                Listo
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="break-anywhere">
                Reseñar {service}
              </DialogTitle>
              <DialogDescription>
                Comparte cómo fue tu experiencia con {providerName}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Puntuación</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "rounded-full text-muted-foreground",
                        value <= score && "text-[#c48100]"
                      )}
                      aria-label={`${value} estrellas`}
                      aria-pressed={value === score}
                      onClick={() => setScore(value)}
                    >
                      <StarIcon
                        className={cn(
                          "size-5",
                          value <= score && "fill-current"
                        )}
                      />
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Llegó puntual</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {punctualityOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={
                          wasPunctual === option.value ? "default" : "outline"
                        }
                        size="sm"
                        className="w-full"
                        aria-pressed={wasPunctual === option.value}
                        onClick={() => setWasPunctual(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Publicación</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={!anon ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      aria-pressed={!anon}
                      onClick={() => setAnon(false)}
                    >
                      Con mi nombre
                    </Button>
                    <Button
                      type="button"
                      variant={anon ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      aria-pressed={anon}
                      onClick={() => setAnon(true)}
                    >
                      Anónima
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="review-comment">Comentario</Label>
                <Textarea
                  id="review-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  placeholder="Ej. llegó puntual, buen trato y excelente resultado"
                />
              </div>
              {error ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircleIcon className="mt-0.5 size-4 text-destructive" />
                    <div className="min-w-0">
                      <p className="font-semibold text-destructive">
                        No se pudo publicar
                      </p>
                      <p className="break-anywhere mt-1 text-muted-foreground">
                        {error.error ??
                          "Revisa tu sesión e intenta nuevamente."}
                      </p>
                      {error.loginHref ? (
                        <Link
                          href={error.loginHref}
                          className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          Entrar como cliente
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <DialogClose
                render={
                  <Button
                    variant="outline"
                    className="w-full sm:flex-1"
                    disabled={isSubmitting}
                  />
                }
              >
                Cancelar
              </DialogClose>
              <Button
                className="w-full sm:flex-1"
                disabled={isSubmitting}
                onClick={() => void submitReview()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon
                      data-icon="inline-start"
                      className="animate-spin"
                    />
                    Publicando
                  </>
                ) : (
                  "Publicar reseña"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
