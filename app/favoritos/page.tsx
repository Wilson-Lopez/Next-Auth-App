import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { FaHeartBroken } from "react-icons/fa";
import { authOptions } from "@/lib/auth";
import { getFavorites } from "@/lib/users";
import { getMoviesByIds } from "@/lib/movies";
import MovieCard from "@/components/MovieCard";

// Página protegida: requiere sesión (también la protege proxy.ts).
export default async function FavoritosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const favoriteIds = getFavorites(session.user.email);
  const movies = getMoviesByIds(favoriteIds);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-2 text-2xl font-bold">Mis favoritos</h1>
        <p className="mb-8 text-sm text-zinc-400">
          Películas que guardaste, {session.user.name ?? "usuario"}.
        </p>

        {movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/15 py-20 text-center">
            <FaHeartBroken size={40} className="text-zinc-600" />
            <p className="text-zinc-400">Todavía no tienes películas favoritas.</p>
            <Link
              href="/"
              className="rounded-full bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} isFavorite />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
