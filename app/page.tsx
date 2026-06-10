import Link from "next/link";
import { getServerSession } from "next-auth";
import { FaStar, FaPlay } from "react-icons/fa";
import { authOptions } from "@/lib/auth";
import { fetchMovies, groupByDirector } from "@/lib/movies";
import { getFavorites } from "@/lib/users";
import MovieCard from "@/components/MovieCard";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const favorites = session?.user?.email
    ? getFavorites(session.user.email)
    : [];

  const movies = await fetchMovies();
  const featured = movies[0]; // mejor valorada para el hero
  const byDirector = groupByDirector(movies);

  return (
    <main className="flex-1">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden border-b border-white/10">
        {/* Imagen de fondo apaisada (responsive) */}
        {featured?.banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featured.banner}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-black/40" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-4 px-4 py-16 sm:py-24">
          <span className="w-fit rounded-full bg-rose-600/30 px-3 py-1 text-xs font-medium text-rose-300 ring-1 ring-rose-500/40">
            ⭐ Destacada
          </span>
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {featured?.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-300">
            <span className="flex items-center gap-1 text-amber-400">
              <FaStar /> {featured?.rating.toFixed(1)}
            </span>
            <span>{featured?.year}</span>
            <span className="hidden sm:inline">•</span>
            <span>{featured?.director}</span>
            <span className="hidden sm:inline">•</span>
            <span>{featured?.duration} min</span>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            {featured?.overview}
          </p>
          {featured && (
            <Link
              href={`/movies/${featured.id}`}
              className="mt-2 flex w-fit items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
            >
              <FaPlay size={13} /> Ver detalles
            </Link>
          )}
        </div>
      </section>

      {/* ---------- Catálogo agrupado por director ---------- */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        {Object.entries(byDirector).map(([director, list]) => (
          <section key={director} className="mb-10 sm:mb-12">
            <h2 className="mb-4 text-lg font-semibold sm:mb-5 sm:text-xl">
              {director}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {list.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isFavorite={favorites.includes(movie.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
