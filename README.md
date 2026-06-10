# 🎬 CineMax — Next-Auth-App

Aplicación web de **películas** construida con **Next.js 16** y **NextAuth.js**, desarrollada para la Semana 13 de Desarrollo Web Avanzado.

Implementa autenticación con **credenciales** y con **GitHub**, registro de usuarios, cifrado de contraseñas con **bcrypt** y **bloqueo de cuenta** tras varios intentos fallidos.

## ✨ Características

- 🔐 **Login con credenciales** (email + contraseña) usando `CredentialsProvider`.
- 📝 **Registro de usuarios** con formulario propio.
- 🔒 **Contraseñas cifradas con bcrypt** (`bcryptjs`).
- 🚫 **Bloqueo de cuenta** tras 5 intentos fallidos (15 min).
- 🐙 **Login con GitHub** (`GitHubProvider`).
- 🎞️ **Catálogo de películas** agrupado por género.
- ❤️ **Favoritos** por usuario (ruta protegida `/favoritos`).
- 🛡️ Rutas protegidas mediante `proxy.ts` (antes `middleware`, renombrado en Next 16).

## 🚀 Cómo ejecutar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## ⚙️ Variables de entorno

Crea un archivo `.env.local` (no se sube al repo):

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secret_generado   # node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# GitHub OAuth — https://github.com/settings/developers
# Callback: http://localhost:3000/api/auth/callback/github
GITHUB_ID=tu_client_id
GITHUB_SECRET=tu_client_secret
```

## 🧱 Stack

- Next.js 16 (App Router)
- NextAuth.js 4
- bcryptjs
- Tailwind CSS 4
- TypeScript

## 📂 Estructura

```
app/
  api/auth/[...nextauth]/   # handler de NextAuth
  api/register/             # endpoint de registro
  api/favorites/            # API de favoritos
  login/  register/         # páginas de auth
  movies/[id]/              # detalle de película
  favoritos/                # ruta protegida
lib/
  auth.ts                   # configuración de NextAuth (providers, callbacks)
  users.ts                  # store de usuarios (bcrypt, intentos, bloqueo)
  movies.ts                 # catálogo de películas
components/                 # Navbar, MovieCard, Poster, FavoriteButton
proxy.ts                    # protección de rutas
```
