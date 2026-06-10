import { NextResponse } from "next/server";
import { createUser } from "@/lib/users";

// POST /api/register  -> crea un usuario nuevo (contraseña cifrada con bcrypt)
export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validaciones básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const user = await createUser(name, email, password);

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al registrar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
