import Link from "next/link"

import { PrototypeShell } from "@/components/prototype-shell"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { messageThreads } from "@/lib/mock-data"

export default function MessagesPage() {
  return (
    <PrototypeShell active="/messages">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold">Mensajes</h1>
        <p className="text-sm text-muted-foreground">
          Toca una conversación para abrir el chat.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {messageThreads.map((thread) => (
          <Link key={thread.id} href={`/messages/${thread.id}`}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{thread.providerName}</CardTitle>
                  {thread.unread && <Badge>Nuevo</Badge>}
                </div>
                <CardDescription className="line-clamp-1">
                  {thread.preview}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </PrototypeShell>
  )
}
