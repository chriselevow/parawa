import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin · Parawa",
  description: "Panel de administración Parawa",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
