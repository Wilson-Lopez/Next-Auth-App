"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FaFilm, FaHeart } from "react-icons/fa";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-white"
        >
          <FaFilm className="text-rose-500" />
          Cine<span className="text-rose-500">Max</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:text-white"
          >
            Inicio
          </Link>

          {status === "authenticated" ? (
            <>
              <Link
                href="/favoritos"
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:text-white"
              >
                <FaHeart className="text-rose-500" size={13} />
                Favoritos
              </Link>
              <span className="hidden text-sm text-zinc-400 sm:inline">
                Hola, {session.user?.name?.split(" ")[0] ?? "usuario"}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:text-white"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-rose-500"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
