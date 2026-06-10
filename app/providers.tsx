"use client";

import { SessionProvider } from "next-auth/react";

// Envuelve la app para que los componentes cliente accedan a la sesión
// mediante el hook useSession().
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
