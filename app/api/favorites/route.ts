import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFavorites, toggleFavorite } from "@/lib/users";

// GET /api/favorites -> lista de ids favoritos del usuario actual
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  return NextResponse.json({ favorites: await getFavorites(session.user.email) });
}

// POST /api/favorites { movieId } -> añade/quita un favorito (toggle)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { movieId } = await request.json();
  if (!movieId) {
    return NextResponse.json({ error: "Falta movieId" }, { status: 400 });
  }

  const favorites = await toggleFavorite(session.user.email, movieId);
  return NextResponse.json({ favorites });
}
