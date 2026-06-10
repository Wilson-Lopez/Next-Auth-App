import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sql } from "@vercel/postgres";

// Almacenamiento de usuarios con DOS modos:
//  - Postgres (Vercel): si existe la variable POSTGRES_URL.
//  - Archivo JSON local: en desarrollo, si no hay base de datos configurada.
// Toda la API pública es asíncrona para que ambos modos sean intercambiables.

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Reglas de bloqueo de cuenta
const MAX_ATTEMPTS = 5; // intentos fallidos permitidos
const LOCK_MINUTES = 15; // minutos que dura el bloqueo

const usePostgres = Boolean(process.env.POSTGRES_URL);

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  failedAttempts: number;
  lockedUntil: number | null; // timestamp en ms, o null si no está bloqueada
  favorites: string[]; // ids de películas marcadas como favoritas
}

export type AuthResult =
  | { ok: true; user: { id: string; name: string; email: string } }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Lógica de bloqueo (compartida por ambos modos de almacenamiento).
// Decide el resultado y qué campos hay que actualizar, sin tocar el storage.
// ---------------------------------------------------------------------------
type AuthDecision = {
  result: AuthResult;
  update: { failedAttempts: number; lockedUntil: number | null } | null;
};

function decideAuth(
  user: User | undefined,
  password: string,
  now: number
): AuthDecision {
  // No revelamos si el correo existe o no.
  if (!user) {
    return { result: { ok: false, error: "Credenciales inválidas" }, update: null };
  }

  // ¿Cuenta bloqueada actualmente?
  if (user.lockedUntil && now < user.lockedUntil) {
    const restanteMin = Math.ceil((user.lockedUntil - now) / 60000);
    return {
      result: {
        ok: false,
        error: `Cuenta bloqueada por demasiados intentos. Intenta en ${restanteMin} min.`,
      },
      update: null,
    };
  }

  // Si el bloqueo expiró, partimos de un contador limpio.
  let attempts = user.failedAttempts;
  if (user.lockedUntil && now >= user.lockedUntil) attempts = 0;

  if (bcrypt.compareSync(password, user.passwordHash)) {
    return {
      result: { ok: true, user: { id: user.id, name: user.name, email: user.email } },
      update: { failedAttempts: 0, lockedUntil: null },
    };
  }

  // Fallo: incrementamos y bloqueamos si supera el límite.
  attempts += 1;
  if (attempts >= MAX_ATTEMPTS) {
    return {
      result: {
        ok: false,
        error: `Demasiados intentos fallidos. Cuenta bloqueada por ${LOCK_MINUTES} min.`,
      },
      update: { failedAttempts: 0, lockedUntil: now + LOCK_MINUTES * 60000 },
    };
  }

  return {
    result: {
      ok: false,
      error: `Credenciales inválidas. Intentos restantes: ${MAX_ATTEMPTS - attempts}.`,
    },
    update: { failedAttempts: attempts, lockedUntil: null },
  };
}

function newUserRecord(
  name: string,
  email: string,
  passwordHash: string
): User {
  return {
    id: crypto.randomUUID(),
    name: name?.trim() || email,
    email,
    passwordHash,
    failedAttempts: 0,
    lockedUntil: null,
    favorites: [],
  };
}

// ===========================================================================
// Modo ARCHIVO (desarrollo local)
// ===========================================================================
function ensureStore(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf8");
}

function readUsers(): User[] {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8")) as User[];
  } catch {
    return [];
  }
}

function writeUsers(users: User[]): void {
  ensureStore();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

const fileStore = {
  async getByEmail(email: string): Promise<User | undefined> {
    return readUsers().find((u) => u.email === email);
  },
  async create(user: User): Promise<void> {
    const users = readUsers();
    if (users.some((u) => u.email === user.email)) {
      throw new Error("El correo ya está registrado");
    }
    users.push(user);
    writeUsers(users);
  },
  async upsertOAuth(user: User): Promise<void> {
    const users = readUsers();
    if (users.some((u) => u.email === user.email)) return;
    users.push(user);
    writeUsers(users);
  },
  async applyAuth(
    email: string,
    update: { failedAttempts: number; lockedUntil: number | null }
  ): Promise<void> {
    const users = readUsers();
    const u = users.find((x) => x.email === email);
    if (!u) return;
    u.failedAttempts = update.failedAttempts;
    u.lockedUntil = update.lockedUntil;
    writeUsers(users);
  },
  async setFavorites(email: string, favorites: string[]): Promise<void> {
    const users = readUsers();
    const u = users.find((x) => x.email === email);
    if (!u) return;
    u.favorites = favorites;
    writeUsers(users);
  },
};

// ===========================================================================
// Modo POSTGRES (Vercel)
// ===========================================================================
let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  return (schemaReady ??= sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL DEFAULT '',
      failed_attempts INT NOT NULL DEFAULT 0,
      locked_until BIGINT,
      favorites JSONB NOT NULL DEFAULT '[]'::jsonb
    );
  `.then(() => undefined));
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToUser(r: any): User {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    passwordHash: r.password_hash,
    failedAttempts: r.failed_attempts,
    lockedUntil: r.locked_until != null ? Number(r.locked_until) : null,
    favorites: Array.isArray(r.favorites) ? r.favorites : [],
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const pgStore = {
  async getByEmail(email: string): Promise<User | undefined> {
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
    return rows[0] ? rowToUser(rows[0]) : undefined;
  },
  async create(user: User): Promise<void> {
    await ensureSchema();
    try {
      await sql`
        INSERT INTO users (id, name, email, password_hash, failed_attempts, locked_until, favorites)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${user.passwordHash}, 0, NULL, '[]'::jsonb)
      `;
    } catch (err: unknown) {
      // 23505 = unique_violation (email duplicado)
      if (err && typeof err === "object" && (err as { code?: string }).code === "23505") {
        throw new Error("El correo ya está registrado");
      }
      throw err;
    }
  },
  async upsertOAuth(user: User): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO users (id, name, email, password_hash, failed_attempts, locked_until, favorites)
      VALUES (${user.id}, ${user.name}, ${user.email}, '', 0, NULL, '[]'::jsonb)
      ON CONFLICT (email) DO NOTHING
    `;
  },
  async applyAuth(
    email: string,
    update: { failedAttempts: number; lockedUntil: number | null }
  ): Promise<void> {
    await ensureSchema();
    await sql`
      UPDATE users
      SET failed_attempts = ${update.failedAttempts}, locked_until = ${update.lockedUntil}
      WHERE email = ${email}
    `;
  },
  async setFavorites(email: string, favorites: string[]): Promise<void> {
    await ensureSchema();
    await sql`
      UPDATE users SET favorites = ${JSON.stringify(favorites)}::jsonb WHERE email = ${email}
    `;
  },
};

// Selección del backend según el entorno.
const store = usePostgres ? pgStore : fileStore;

// ===========================================================================
// API pública (asíncrona) — usada por NextAuth y las rutas API.
// ===========================================================================
export async function getUserByEmail(email: string): Promise<User | undefined> {
  return store.getByEmail(email.trim().toLowerCase());
}

/** Crea un usuario nuevo cifrando la contraseña con bcrypt. */
export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const user = newUserRecord(
    name.trim(),
    email.trim().toLowerCase(),
    bcrypt.hashSync(password, 10)
  );
  await store.create(user);
  return user;
}

/** Verifica credenciales aplicando la lógica de intentos/bloqueo. */
export async function authenticate(
  email: string,
  password: string
): Promise<AuthResult> {
  const normalized = email.trim().toLowerCase();
  const user = await store.getByEmail(normalized);
  const { result, update } = decideAuth(user, password, Date.now());
  if (update) await store.applyAuth(normalized, update);
  return result;
}

/** Registra un usuario ligero (sin contraseña) para proveedores OAuth. */
export async function ensureOAuthUser(email: string, name: string): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const existing = await store.getByEmail(normalized);
  if (existing) return existing;
  const user = newUserRecord(name, normalized, "");
  await store.upsertOAuth(user);
  return user;
}

// ----------------------- Favoritos -----------------------
export async function getFavorites(email: string): Promise<string[]> {
  const user = await store.getByEmail(email.trim().toLowerCase());
  return user?.favorites ?? [];
}

/** Añade o quita una película de favoritos (toggle). Devuelve la lista final. */
export async function toggleFavorite(
  email: string,
  movieId: string
): Promise<string[]> {
  const normalized = email.trim().toLowerCase();
  const user = await store.getByEmail(normalized);
  if (!user) return [];

  const favorites = user.favorites.includes(movieId)
    ? user.favorites.filter((id) => id !== movieId)
    : [...user.favorites, movieId];

  await store.setFavorites(normalized, favorites);
  return favorites;
}
