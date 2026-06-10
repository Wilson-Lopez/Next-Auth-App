import Link from "next/link";
import { FaStar } from "react-icons/fa";
import type { Movie } from "@/lib/movies";
import Poster from "./Poster";
import FavoriteButton from "./FavoriteButton";

export default function MovieCard({
  movie,
  isFavorite = false,
}: {
  movie: Movie;
  isFavorite?: boolean;
}) {
  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group relative block overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10 transition-transform hover:-translate-y-1 hover:ring-white/30"
    >
      <div className="relative aspect-2/3 w-full">
        <Poster
          src={movie.poster}
          title={movie.title}
          className="h-full w-full"
        />
        {/* Botón de favorito sobre el póster */}
        <div className="absolute right-2 top-2">
          <FavoriteButton movieId={movie.id} initialFavorite={isFavorite} />
        </div>
        {/* Degradado inferior con info al pasar el mouse */}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 to-transparent p-3">
          <h3 className="truncate text-sm font-semibold text-white">
            {movie.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-300">
            <span>{movie.year}</span>
            <span className="flex items-center gap-1 text-amber-400">
              <FaStar size={11} /> {movie.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
