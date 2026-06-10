import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { authenticate, ensureOAuthUser } from "@/lib/users";

export const authOptions: NextAuthOptions = {
  providers: [
    // 1) Inicio de sesión con credenciales (usuario y contraseña)
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Faltan credenciales");
        }

        // Verifica password (bcrypt) y aplica el bloqueo por intentos.
        const result = authenticate(credentials.email, credentials.password);

        if (!result.ok) {
          // El mensaje llega al cliente vía el error de signIn.
          throw new Error(result.error);
        }

        return result.user; // NextAuth crea la sesión con estos datos
      },
    }),

    // 2) Inicio de sesión con GitHub (OAuth)
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),

    // 3) Inicio de sesión con Google (OAuth)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  // Credentials requiere estrategia JWT para la sesión.
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login", // usamos nuestra página de login personalizada
  },

  callbacks: {
    // Al entrar con un proveedor externo, registramos un usuario ligero
    // para que sus favoritos funcionen igual que con credenciales.
    async signIn({ user, account }) {
      const isOAuth =
        account?.provider === "github" || account?.provider === "google";
      if (isOAuth && user.email) {
        ensureOAuthUser(user.email, user.name ?? user.email);
      }
      return true;
    },
    // Guardamos el id del usuario en el token.
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // Exponemos el id en la sesión del cliente.
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
