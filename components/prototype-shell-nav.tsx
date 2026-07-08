"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { SignOutButton } from "@/components/role-session-actions"
import { buttonVariants } from "@/components/ui/button"
import { type AppRole } from "@/lib/roles"
import { cn } from "@/lib/utils"

export type ShellNavLink = {
  href: string
  label: string
}

function getCurrentPath() {
  return `${window.location.pathname}${window.location.hash}`
}

export function PrototypeShellNav({
  links,
  role,
  activeFallback,
}: {
  links: ShellNavLink[]
  role: AppRole | null
  activeFallback?: string
}) {
  const [currentPath, setCurrentPath] = useState(activeFallback ?? "")

  useEffect(() => {
    const updateCurrentPath = () => setCurrentPath(getCurrentPath())

    updateCurrentPath()
    window.addEventListener("hashchange", updateCurrentPath)
    window.addEventListener("popstate", updateCurrentPath)

    return () => {
      window.removeEventListener("hashchange", updateCurrentPath)
      window.removeEventListener("popstate", updateCurrentPath)
    }
  }, [])

  return (
    <nav className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1 pb-0.5 md:mx-0 md:justify-end md:overflow-visible md:px-0 md:pb-0">
      {links.map((link) => {
        const isHashLink = link.href.includes("#")
        const isActive = isHashLink
          ? currentPath === link.href
          : currentPath === link.href ||
            (currentPath.startsWith(`${link.href}#`) &&
              !links.some((item) => item.href === currentPath))

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              buttonVariants({
                variant: isActive ? "default" : "ghost",
                size: "sm",
              }),
              "h-8 rounded-lg px-2.5 text-xs sm:px-3 sm:text-[0.8rem]"
            )}
          >
            {link.label}
          </Link>
        )
      })}
      {role ? <SignOutButton role={role} /> : null}
    </nav>
  )
}
