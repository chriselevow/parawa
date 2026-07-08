import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PARAWA_APP_ICON_URL } from "@/lib/brand"

export const metadata: Metadata = {
  title: "Parawa",
  description: "Mercado digital de servicios locales en Panamá.",
  icons: {
    icon: [{ url: PARAWA_APP_ICON_URL, sizes: "400x400", type: "image/webp" }],
    apple: [{ url: PARAWA_APP_ICON_URL, sizes: "400x400", type: "image/webp" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="font-sans antialiased">
      <body>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
