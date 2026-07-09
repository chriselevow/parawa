import { NextResponse } from "next/server"

import { createFirebaseLoginSession } from "@/lib/firebase-auth"
import { normalizeRole } from "@/lib/roles"

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(request: Request) {
  let body: Record<string, unknown>

  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida para Firebase Auth." },
      { status: 400 }
    )
  }

  const email = text(body.email)
  const password = text(body.password)
  const requestedRole = normalizeRole(body.role)

  if (!email || !password || !requestedRole) {
    return NextResponse.json(
      { error: "Correo, contraseña y rol son obligatorios." },
      { status: 400 }
    )
  }

  try {
    const session = await createFirebaseLoginSession({
      email,
      nextPath: text(body.nextPath),
      password,
      requestedRole,
    })

    return NextResponse.json(session)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No pudimos iniciar sesión con Firebase.",
      },
      { status: 401 }
    )
  }
}
