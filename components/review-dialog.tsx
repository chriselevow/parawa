"use client"

import { useState } from "react"
import { CheckCircle2Icon, StarIcon } from "lucide-react"

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

export function ReviewDialog({
  providerName,
  service,
}: {
  providerName: string
  service: string
}) {
  const [score, setScore] = useState(5)
  const [submitted, setSubmitted] = useState(false)

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) setSubmitted(false)
      }}
    >
      <DialogTrigger render={<Button size="sm" variant="secondary" />}>
        Dejar reseña
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <>
            <DialogHeader>
              <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-[#e7f7f3] text-[#087466]">
                <CheckCircle2Icon />
              </div>
              <DialogTitle>Reseña guardada</DialogTitle>
              <DialogDescription>
                En la versión con Firebase esta reseña se guardará en Firestore
                y actualizará el rating del proveedor.
              </DialogDescription>
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
              <div className="flex flex-col gap-2">
                <Label htmlFor="review-comment">Comentario</Label>
                <Textarea
                  id="review-comment"
                  rows={4}
                  placeholder="Ej. llegó puntual, buen trato y excelente resultado"
                />
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
                className="w-full sm:flex-1"
                onClick={() => setSubmitted(true)}
              >
                Publicar reseña
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
