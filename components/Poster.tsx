"use client";

import { useState } from "react";

// Muestra el póster de la película. Si la imagen no carga (404 del CDN),
// cae a un gradiente con el título para que la tarjeta nunca se vea rota.
export default function Poster({
  src,
  title,
  className = "",
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-linear-to-br from-indigo-600 via-purple-700 to-rose-600 p-4 text-center ${className}`}
      >
        <span className="text-lg font-semibold text-white drop-shadow">
          {title}
        </span>
      </div>
    );
  }

  // Usamos <img> (no next/image) para controlar el respaldo con onError.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Póster de ${title}`}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
      loading="lazy"
    />
  );
}
