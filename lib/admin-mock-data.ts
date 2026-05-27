export type AdminUser = {
  id: string
  name: string
  email: string
  role: "client" | "provider"
  joined: string
  status: "active" | "suspended"
}

export type PendingVerification = {
  id: string
  name: string
  category: string
  submitted: string
  documents: string
}

export const adminStats = {
  totalUsers: 1248,
  activeProviders: 186,
  bookingsThisWeek: 342,
  revenueMonth: 18450,
  pendingVerifications: 7,
  openDisputes: 2,
}

export const adminUsers: AdminUser[] = [
  {
    id: "u1",
    name: "Pedro López",
    email: "pedro@email.com",
    role: "client",
    joined: "12 Abr 2026",
    status: "active",
  },
  {
    id: "u2",
    name: "María González",
    email: "maria@email.com",
    role: "provider",
    joined: "3 Mar 2026",
    status: "active",
  },
  {
    id: "u3",
    name: "Luis Herrera",
    email: "luis@email.com",
    role: "provider",
    joined: "18 May 2026",
    status: "active",
  },
  {
    id: "u4",
    name: "Camila Ruiz",
    email: "camila@email.com",
    role: "client",
    joined: "1 May 2026",
    status: "suspended",
  },
]

export const pendingVerifications: PendingVerification[] = [
  {
    id: "v1",
    name: "Roberto Vega",
    category: "Técnico",
    submitted: "Hace 2 h",
    documents: "Cédula, foto perfil",
  },
  {
    id: "v2",
    name: "Elena Morales",
    category: "Belleza",
    submitted: "Hace 5 h",
    documents: "Cédula, certificado",
  },
  {
    id: "v3",
    name: "Jorge Pineda",
    category: "Hogar",
    submitted: "Ayer",
    documents: "Cédula, referencias",
  },
]

export const recentAdminBookings = [
  {
    id: "AB-1042",
    client: "Pedro L.",
    provider: "María González",
    service: "Gel nails",
    amount: 35,
    status: "completed",
  },
  {
    id: "AB-1041",
    client: "Lucía R.",
    provider: "Carlos Méndez",
    service: "Corte clásico",
    amount: 15,
    status: "accepted",
  },
  {
    id: "AB-1040",
    client: "Ana T.",
    provider: "Luis Herrera",
    service: "Diagnóstico",
    amount: 35,
    status: "pending",
  },
  {
    id: "AB-1039",
    client: "Miguel S.",
    provider: "Sofía Vargas",
    service: "Matemáticas",
    amount: 20,
    status: "cancelled",
  },
]
