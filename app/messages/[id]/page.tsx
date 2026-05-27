import Link from "next/link"
import { notFound } from "next/navigation"

import { PrototypeShell } from "@/components/prototype-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { buttonVariants } from "@/components/ui/button"
import { getProvider, messageThreads } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const thread = messageThreads.find((t) => t.id === id)
  const provider = getProvider(id)
  if (!thread && !provider) notFound()

  const name = thread?.providerName ?? provider?.name ?? "Chat"

  const messages = [
    { from: "them", text: "Hola, ¿qué servicio necesitas?" },
    { from: "me", text: "Hola, quisiera gel nails para el viernes." },
    { from: "them", text: thread?.preview ?? "Perfecto, tengo espacio a las 3pm." },
  ]

  return (
    <PrototypeShell active="/messages">
      <Link
        href="/messages"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "self-start")}
      >
        ← Mensajes
      </Link>

      <div className="flex min-h-[24rem] flex-col rounded-xl border">
        <div className="border-b px-4 py-3">
          <h1 className="font-medium">{name}</h1>
          <p className="text-xs text-muted-foreground">Prototipo · sin envío real</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  msg.from === "me"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {msg.text}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2 border-t p-3">
          <Input placeholder="Escribe un mensaje…" />
          <Button>Enviar</Button>
        </div>
      </div>

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
