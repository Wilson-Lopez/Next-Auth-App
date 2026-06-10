"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function FavoriteButton({
  movieId,
  initialFavorite = false,
  size = 18,
}: {
  movieId: string;
  initialFavorite?: boolean;
  size?: number;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault(); // no navegar si está dentro de un enlace
    e.stopPropagation();

    // Si no hay sesión, mandamos al login.
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setLoading(true);
    const prev = favorite;
    setFavorite(!prev); // actualización optimista

    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId }),
    });

    if (!res.ok) {
      setFavorite(prev); // revertir si falla
    } else {
      const data = await res.json();
      setFavorite(data.favorites.includes(movieId));
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
      title={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
      className="flex items-center justify-center rounded-full bg-black/60 p-2 text-white backdrop-blur transition-transform hover:scale-110 disabled:opacity-50"
    >
      {favorite ? (
        <FaHeart size={size} className="text-rose-500" />
      ) : (
        <FaRegHeart size={size} />
      )}
    </button>
  );
}
