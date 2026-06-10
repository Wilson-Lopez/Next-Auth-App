import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Almacenamiento simple en archivo JSON (sin base de datos).
// Para producción se usaría una BD real; aquí basta para la tarea.
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Reglas de bloqueo de cuenta
const MAX_ATTEMPTS = 5; // intentos fallidos permitidos
const LOCK_MINUTES = 15; // minutos que dura el bloqueo

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  failedAttempts: number;
  lockedUntil: number | null; // timestamp en ms, o null si no está bloqueada
  favorites: string[]; // ids de películas marcadas como favoritas
}

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

export function getUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase();
  return readUsers().find((u) => u.email === normalized);
}

/**
 * Crea un usuario nuevo cifrando la contraseña con bcrypt.
 * Lanza un error si el email ya está registrado.
 */
export function createUser(name: string, email: string, password: string): User {
  const normalized = email.trim().toLowerCase();
  const users = readUsers();

  if (users.some((u) => u.email === normalized)) {
    throw new Error("El correo ya está registrado");
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalized,
    passwordHash: bcrypt.hashSync(password, 10), // cifrado con bcrypt
    failedAttempts: 0,
    lockedUntil: null,
    favorites: [],
  };

  users.push(newUser);
  writeUsers(users);
  return newUser;
}

export type AuthResult =
  | { ok: true; user: { id: string; name: string; email: string } }
  | { ok: false; error: string };

/**
 * Verifica las credenciales aplicando la lógica de bloqueo:
 * - Si la cuenta está bloqueada y el tiempo no expiró, rechaza.
 * - Tras MAX_ATTEMPTS fallos, bloquea la cuenta por LOCK_MINUTES.
 * - Un login correcto reinicia el contador de intentos.
 */
export function authenticate(email: string, password: string): AuthResult {
  const users = readUsers();
  const normalized = email.trim().toLowerCase();
  const user = users.find((u) => u.email === normalized);

  // No revelamos si el correo existe o no.
  if (!user) {
    return { ok: false, error: "Credenciales inválidas" };
  }

  const now = Date.now();

  // ¿Cuenta bloqueada actualmente?
  if (user.lockedUntil && now < user.lockedUntil) {
    const restanteMin = Math.ceil((user.lockedUntil - now) / 60000);
    return {
      ok: false,
      error: `Cuenta bloqueada por demasiados intentos. Intenta en ${restanteMin} min.`,
    };
  }

  // El bloqueo expiró: reiniciamos el contador.
  if (user.lockedUntil && now >= user.lockedUntil) {
    user.lockedUntil = null;
    user.failedAttempts = 0;
  }

  const passwordOk = bcrypt.compareSync(password, user.passwordHash);

  if (passwordOk) {
    // Éxito: reiniciamos intentos.
    user.failedAttempts = 0;
    user.lockedUntil = null;
    writeUsers(users);
    return { ok: true, user: { id: user.id, name: user.name, email: user.email } };
  }

  // Fallo: incrementamos intentos y bloqueamos si supera el límite.
  user.failedAttempts += 1;

  if (user.failedAttempts >= MAX_ATTEMPTS) {
    user.lockedUntil = now + LOCK_MINUTES * 60000;
    user.failedAttempts = 0;
    writeUsers(users);
    return {
      ok: false,
      error: `Demasiados intentos fallidos. Cuenta bloqueada por ${LOCK_MINUTES} min.`,
    };
  }

  const restantes = MAX_ATTEMPTS - user.failedAttempts;
  writeUsers(users);
  return {
    ok: false,
    error: `Credenciales inválidas. Intentos restantes: ${restantes}.`,
  };
}

// ----------------------- OAuth (GitHub) -----------------------

/**
 * Crea un registro ligero para un usuario que inició sesión con un proveedor
 * externo (sin contraseña). Así los favoritos funcionan también con GitHub.
 */
export function ensureOAuthUser(email: string, name: string): User {
  const normalized = email.trim().toLowerCase();
  const users = readUsers();
  const existing = users.find((u) => u.email === normalized);
  if (existing) return existing;

  const newUser: User = {
    id: crypto.randomUUID(),
    name: name?.trim() || normalized,
    email: normalized,
    passwordHash: "", // sin contraseña: no puede entrar por credenciales
    failedAttempts: 0,
    lockedUntil: null,
    favorites: [],
  };
  users.push(newUser);
  writeUsers(users);
  return newUser;
}

// ----------------------- Favoritos -----------------------

export function getFavorites(email: string): string[] {
  const user = getUserByEmail(email);
  return user?.favorites ?? [];
}

/** Añade o quita una película de favoritos (toggle). Devuelve la lista resultante. */
export function toggleFavorite(email: string, movieId: string): string[] {
  const normalized = email.trim().toLowerCase();
  const users = readUsers();
  const user = users.find((u) => u.email === normalized);
  if (!user) return [];

  if (!user.favorites) user.favorites = [];

  if (user.favorites.includes(movieId)) {
    user.favorites = user.favorites.filter((id) => id !== movieId);
  } else {
    user.favorites.push(movieId);
  }

  writeUsers(users);
  return user.favorites;
}
