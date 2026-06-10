"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaGithub, FaGoogle, FaFilm } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // redirect:false para manejar el error nosotros (intentos, bloqueo, etc.)
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
      return;
    }

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

        <h1 className="text-2xl font-semibold text-white">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Ingresa con tus credenciales o con GitHub.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-zinc-500">
          <span className="h-px flex-1 bg-white/10" />
          o
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <FaGithub size={18} />
            Continuar con GitHub
          </button>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <FaGoogle size={16} className="text-rose-400" />
            Continuar con Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-400">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-rose-400 underline">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
