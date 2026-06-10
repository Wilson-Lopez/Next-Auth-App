import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// NextAuth maneja todas las rutas /api/auth/* (signin, callback, signout, etc.)
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
