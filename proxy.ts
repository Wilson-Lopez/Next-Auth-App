import { withAuth } from "next-auth/middleware";

// (Antes "middleware.ts"; en Next.js 16 la convención se renombró a "proxy".)
// Protege rutas privadas: si no hay sesión, redirige a /login.
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Solo aplica a la sección de favoritos (requiere sesión).
  matcher: ["/favoritos/:path*"],
};
