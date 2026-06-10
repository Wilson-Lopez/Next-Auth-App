"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaFilm } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1) Registrar el usuario (la contraseña se cifra con bcrypt en el server).
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al registrar");
      setLoading(false);
      return;
    }

    // 2) Iniciar sesión automáticamente tras el registro.
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-black p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-2 text-xl font-bold">
          <FaFilm className="text-rose-500" />
          Cine<span className="text-rose-500">Max</span>
        </div>

        <h1 className="text-2xl font-semibold text-white">Crear cuenta</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Regístrate con tu correo y contraseña.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-rose-500"
          />
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-rose-500"
          />
          <input
            type="password"
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-rose-500"
          />

          {error && (
            <p className="rounded-lg bg-rose-950/50 px-3 py-2 text-sm text-rose-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Registrarme"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-rose-400 underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
