import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { FaStar, FaArrowLeft } from "react-icons/fa";
import { authOptions } from "@/lib/auth";
import { getMovieById } from "@/lib/movies";
import { getFavorites } from "@/lib/users";
import Poster from "@/components/Poster";
import FavoriteButton from "@/components/FavoriteButton";

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // en Next 16 params es una Promise
  const movie = await getMovieById(id);
  if (!movie) notFound();

  const session = await getServerSession(authOptions);
  const isFavorite = session?.user?.email
    ? getFavorites(session.user.email).includes(movie.id)
    : false;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link
          href="/"
          className="mb-8 flex w-fit items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <FaArrowLeft size={12} /> Volver al catálogo
        </Link>

        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          {/* Póster */}
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
            <Poster
              src={movie.poster}
              title={movie.title}
              className="aspect-2/3 w-full"
            />
          </div>

          {/* Información */}
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">{movie.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
              <span className="flex items-center gap-1 text-amber-400">
                <FaStar /> {movie.rating.toFixed(1)} / 10
              </span>
              <span>{movie.year}</span>
              <span>•</span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                {movie.genre}
              </span>
              <span>•</span>
              <span>{movie.duration} min</span>
            </div>

            <p className="mt-6 leading-relaxed text-zinc-300">
              {movie.overview}
            </p>

            <p className="mt-4 text-sm text-zinc-400">
              <span className="font-medium text-zinc-200">Director:</span>{" "}
              {movie.director}
            </p>

            <div className="mt-8 flex items-center gap-3">
              <FavoriteButton
                movieId={movie.id}
                initialFavorite={isFavorite}
                size={20}
              />
              <span className="text-sm text-zinc-400">
                {session
                  ? isFavorite
                    ? "En tus favoritos"
                    : "Añadir a favoritos"
                  : "Inicia sesión para guardar favoritos"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
