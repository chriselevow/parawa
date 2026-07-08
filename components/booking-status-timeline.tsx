import { CheckCircle2Icon, CircleIcon, Clock3Icon } from "lucide-react"

import type { BookingTimelineItem } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function BookingStatusTimeline({
  items,
}: {
  items: BookingTimelineItem[]
}) {
  return (
    <ol className="flex flex-col gap-3">
      {items.map((item, index) => {
        const isDone = item.state === "done"
        const isCurrent = item.state === "current"

        return (
          <li key={`${item.label}-${index}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border",
                  isDone && "border-[#087466]/20 bg-[#e7f7f3] text-[#087466]",
                  isCurrent && "border-primary/25 bg-primary/10 text-primary",
                  item.state === "upcoming" &&
                    "border-border bg-background text-muted-foreground"
                )}
              >
                {isDone ? (
                  <CheckCircle2Icon className="size-4" />
                ) : isCurrent ? (
                  <Clock3Icon className="size-4" />
                ) : (
                  <CircleIcon className="size-3" />
                )}
              </span>
              {index !== items.length - 1 ? (
                <span className="mt-2 h-full min-h-6 w-px bg-border" />
              ) : null}
            </div>
            <div className="min-w-0 pb-2">
              <p className="font-medium">{item.label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {item.detail}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
