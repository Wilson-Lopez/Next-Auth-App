import Link from "next/link";
import { getServerSession } from "next-auth";
import { FaStar, FaPlay } from "react-icons/fa";
import { authOptions } from "@/lib/auth";
import { getAllMovies, getGenres } from "@/lib/movies";
import { getFavorites } from "@/lib/users";
import MovieCard from "@/components/MovieCard";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const favorites = session?.user?.email
    ? getFavorites(session.user.email)
    : [];

  const movies = getAllMovies();
  const genres = getGenres();
  const featured = movies[0]; // película destacada del hero

  return (
    <main className="flex-1">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-linear-to-br from-rose-900/40 via-black to-indigo-900/40" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-4 px-4 py-20">
          <span className="w-fit rounded-full bg-rose-600/20 px-3 py-1 text-xs font-medium text-rose-400">
            Destacada
          </span>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
            {featured.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-zinc-300">
            <span className="flex items-center gap-1 text-amber-400">
              <FaStar /> {featured.rating.toFixed(1)}
            </span>
            <span>{featured.year}</span>
            <span>•</span>
            <span>{featured.genre}</span>
            <span>•</span>
            <span>{featured.duration} min</span>
          </div>
          <p className="max-w-xl text-zinc-300">{featured.overview}</p>
          <Link
            href={`/movies/${featured.id}`}
            className="mt-2 flex w-fit items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
          >
            <FaPlay size={13} /> Ver detalles
          </Link>
        </div>
      </section>

      {/* ---------- Catálogo por género ---------- */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        {genres.map((genre) => {
          const ofGenre = movies.filter((m) => m.genre === genre);
          return (
            <section key={genre} className="mb-12">
              <h2 className="mb-5 text-xl font-semibold">{genre}</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {ofGenre.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isFavorite={favorites.includes(movie.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
