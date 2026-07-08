export type BookingStatus = "pending" | "accepted" | "completed" | "cancelled"

export type PaymentStatus = "pending" | "authorized" | "paid" | "refunded"

export type BookingTimelineItem = {
  label: string
  detail: string
  state: "done" | "current" | "upcoming"
}

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
  imageUrl?: string
}

export type Booking = {
  id: string
  code: string
  clientName: string
  providerId: string
  providerName: string
  service: string
  date: string
  shortDate: string
  time: string
  duration: string
  status: BookingStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  serviceLocation: "A domicilio" | "En local" | "Online"
  address: string
  notes: string
  createdAt: string
  total: number
  timeline: BookingTimelineItem[]
}

export type MessageThread = {
  id: string
  providerId: string
  providerName: string
  service: string
  bookingId: string
  bookingStatus: BookingStatus
  timestamp: string
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
    code: "PAR-1042",
    clientName: "Pedro López",
    providerId: "maria-nails",
    providerName: "María González",
    service: "Gel nails",
    date: "Vie 23 May · 3:00 PM",
    shortDate: "Vie 23 May",
    time: "3:00 PM",
    duration: "75 min",
    status: "accepted",
    paymentStatus: "authorized",
    paymentMethod: "Visa terminada en 4242",
    serviceLocation: "A domicilio",
    address: "San Francisco, PH Pacific Hills, lobby principal",
    notes: "Prefiere diseño natural. Tiene estacionamiento para visitantes.",
    createdAt: "Hace 18 min",
    total: 35,
    timeline: [
      {
        label: "Solicitud enviada",
        detail: "Pedro solicitó Gel nails para el viernes.",
        state: "done",
      },
      {
        label: "Proveedor confirmó",
        detail: "María aceptó el horario de 3:00 PM.",
        state: "done",
      },
      {
        label: "Servicio programado",
        detail: "Próximo paso: María llega al domicilio.",
        state: "current",
      },
      {
        label: "Completar y reseñar",
        detail: "Se habilita al cerrar el servicio.",
        state: "upcoming",
      },
    ],
  },
  {
    id: "b2",
    code: "PAR-1043",
    clientName: "Pedro López",
    providerId: "luis-tech",
    providerName: "Luis Herrera",
    service: "Diagnóstico",
    date: "Sáb 24 May · 10:00 AM",
    shortDate: "Sáb 24 May",
    time: "10:00 AM",
    duration: "60 min",
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "Por autorizar",
    serviceLocation: "A domicilio",
    address: "El Cangrejo, calle Eusebio A. Morales",
    notes:
      "Revisar nevera que no enfría. Cliente puede recibir entre 9:30 y 11:00.",
    createdAt: "Hace 42 min",
    total: 35,
    timeline: [
      {
        label: "Solicitud enviada",
        detail: "El proveedor todavía no confirma.",
        state: "done",
      },
      {
        label: "Esperando respuesta",
        detail: "Luis debe aceptar o proponer otro horario.",
        state: "current",
      },
      {
        label: "Pago autorizado",
        detail: "Se autoriza cuando el proveedor acepta.",
        state: "upcoming",
      },
    ],
  },
  {
    id: "b3",
    code: "PAR-1031",
    clientName: "Pedro López",
    providerId: "carlos-barber",
    providerName: "Carlos Méndez",
    service: "Corte clásico",
    date: "Lun 12 May · 6:30 PM",
    shortDate: "Lun 12 May",
    time: "6:30 PM",
    duration: "45 min",
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "Mastercard terminada en 1188",
    serviceLocation: "A domicilio",
    address: "Bella Vista, PH The Towers",
    notes: "Corte clásico con arreglo ligero de barba.",
    createdAt: "12 May 2026",
    total: 15,
    timeline: [
      {
        label: "Solicitud enviada",
        detail: "Reserva creada desde el perfil de Carlos.",
        state: "done",
      },
      {
        label: "Proveedor confirmó",
        detail: "Carlos confirmó el horario de 6:30 PM.",
        state: "done",
      },
      {
        label: "Servicio completado",
        detail: "Pago capturado y servicio cerrado.",
        state: "done",
      },
      {
        label: "Reseña pendiente",
        detail: "Puedes dejar una reseña sobre la experiencia.",
        state: "current",
      },
    ],
  },
]

export const messageThreads: MessageThread[] = [
  {
    id: "maria-nails",
    providerId: "maria-nails",
    providerName: "María González",
    service: "Gel nails",
    bookingId: "b1",
    bookingStatus: "accepted",
    timestamp: "8 min",
    preview: "Perfecto, llego 10 min antes. ¿Tienes estacionamiento?",
    unread: true,
  },
  {
    id: "carlos-barber",
    providerId: "carlos-barber",
    providerName: "Carlos Méndez",
    service: "Corte clásico",
    bookingId: "b3",
    bookingStatus: "completed",
    timestamp: "12 May",
    preview: "Gracias por la reseña. Nos vemos el próximo mes.",
    unread: false,
  },
]

export function getProvider(id: string) {
  return providers.find((p) => p.id === id)
}

export function getBooking(id: string) {
  return bookings.find((booking) => booking.id === id)
}

export function getBookingForProvider(providerId: string) {
  return bookings.find((booking) => booking.providerId === providerId)
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
