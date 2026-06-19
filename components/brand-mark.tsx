import Link from "next/link"

import { PARAWA_APP_ICON_URL } from "@/lib/brand"
import { cn } from "@/lib/utils"

type BrandMarkProps = {
  className?: string
  href?: string
  showText?: boolean
  size?: "sm" | "md"
}

export function BrandMark({
  className,
  href,
  showText = true,
  size = "md",
}: BrandMarkProps) {
  const iconClassName =
    size === "sm" ? "size-8 rounded-[0.7rem]" : "size-10 rounded-[0.85rem]"
  const textClassName = size === "sm" ? "text-sm" : "text-xl"

  const content = (
    <>
      <span
        className={cn(
          "inline-flex shrink-0 overflow-hidden border border-primary/15 bg-primary shadow-sm shadow-primary/15 ring-1 ring-primary/10",
          iconClassName
        )}
      >
        <img
          src={PARAWA_APP_ICON_URL}
          alt=""
          className="size-full object-cover"
          loading="eager"
        />
      </span>
      {showText ? (
        <span
          className={cn(
            "font-heading font-semibold tracking-tight text-foreground",
            textClassName
          )}
        >
          Parawa
        </span>
      ) : null}
    </>
  )

  const sharedClassName = cn("inline-flex items-center gap-2.5", className)

  if (href) {
    return (
      <Link href={href} className={sharedClassName} aria-label="Parawa">
        {content}
      </Link>
    )
  }

  return (
    <span className={sharedClassName} aria-label="Parawa">
      {content}
    </span>
  )
}
