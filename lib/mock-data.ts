export type BookingStatus = "pending" | "accepted" | "completed" | "cancelled"

export type Provider = {
  id: string
  name: string
  category: string
  area: string
  rating: number
  reviews: number
  priceFrom: number
  verified: boolean
  bio: string
  services: string[]
}

export type Booking = {
  id: string
  providerId: string
  providerName: string
  service: string
  date: string
  status: BookingStatus
  total: number
}

export type MessageThread = {
  id: string
  providerName: string
  preview: string
  unread: boolean
}

export const categories = [
  "Todos",
  "Hogar",
  "Belleza",
  "Técnico",
  "Fitness",
  "Educación",
] as const

export const providers: Provider[] = [
  {
    id: "maria-nails",
    name: "María González",
    category: "Belleza",
    area: "San Francisco, PA",
    rating: 4.9,
    reviews: 128,
    priceFrom: 25,
    verified: true,
    bio: "Manicura y pedicura a domicilio. Productos profesionales y agenda flexible.",
    services: ["Manicure clásico", "Gel nails", "Pedicure spa"],
  },
  {
    id: "carlos-barber",
    name: "Carlos Méndez",
    category: "Belleza",
    area: "Bella Vista, PA",
    rating: 4.8,
    reviews: 94,
    priceFrom: 15,
    verified: true,
    bio: "Barbero con 8 años de experiencia. Corte, barba y atención en tu casa.",
    services: ["Corte clásico", "Fade", "Arreglo de barba"],
  },
  {
    id: "ana-clean",
    name: "Ana Rodríguez",
    category: "Hogar",
    area: "Costa del Este, PA",
    rating: 4.7,
    reviews: 56,
    priceFrom: 40,
    verified: true,
    bio: "Limpieza profunda y mantenimiento semanal para hogares y oficinas pequeñas.",
    services: ["Limpieza básica", "Limpieza profunda", "Planchado"],
  },
  {
    id: "luis-tech",
    name: "Luis Herrera",
    category: "Técnico",
    area: "El Cangrejo, PA",
    rating: 4.6,
    reviews: 41,
    priceFrom: 35,
    verified: false,
    bio: "Reparación de electrodomésticos, instalación de aires y mantenimiento eléctrico básico.",
    services: ["Diagnóstico", "Instalación AC", "Reparación nevera"],
  },
  {
    id: "sofia-tutor",
    name: "Sofía Vargas",
    category: "Educación",
    area: "Clayton, PA",
    rating: 5,
    reviews: 22,
    priceFrom: 20,
    verified: true,
    bio: "Tutora de matemáticas y ciencias para primaria y secundaria. Sesiones presenciales u online.",
    services: ["Matemáticas", "Física básica", "Preparación exámenes"],
  },
  {
    id: "diego-trainer",
    name: "Diego Salazar",
    category: "Fitness",
    area: "Punta Pacífica, PA",
    rating: 4.8,
    reviews: 37,
    priceFrom: 30,
    verified: true,
    bio: "Entrenador personal. Planes a medida en tu edificio, parque o gimnasio.",
    services: ["Sesión 1:1", "Plan mensual", "Evaluación inicial"],
  },
]

export const bookings: Booking[] = [
  {
    id: "b1",
    providerId: "maria-nails",
    providerName: "María González",
    service: "Gel nails",
    date: "Vie 23 May · 3:00 PM",
    status: "accepted",
    total: 35,
  },
  {
    id: "b2",
    providerId: "luis-tech",
    providerName: "Luis Herrera",
    service: "Diagnóstico",
    date: "Sáb 24 May · 10:00 AM",
    status: "pending",
    total: 35,
  },
  {
    id: "b3",
    providerId: "carlos-barber",
    providerName: "Carlos Méndez",
    service: "Corte clásico",
    date: "Lun 12 May · 6:30 PM",
    status: "completed",
    total: 15,
  },
]

export const messageThreads: MessageThread[] = [
  {
    id: "maria-nails",
    providerName: "María González",
    preview: "Perfecto, llego 10 min antes. ¿Tienes estacionamiento?",
    unread: true,
  },
  {
    id: "carlos-barber",
    providerName: "Carlos Méndez",
    preview: "Gracias por la reseña. Nos vemos el próximo mes.",
    unread: false,
  },
]

export function getProvider(id: string) {
  return providers.find((p) => p.id === id)
}

export function statusLabel(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "Pendiente"
    case "accepted":
      return "Confirmada"
    case "completed":
      return "Completada"
    case "cancelled":
      return "Cancelada"
  }
}
