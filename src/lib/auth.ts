import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "devis_admin";

function secret() {
  return process.env.ADMIN_SECRET || "dev-secret-a-remplacer";
}

function sign(value: string) {
  const mac = createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${mac}`;
}

function validToken(token: string | undefined) {
  if (!token) return false;
  const expected = sign("admin");
  const left = Buffer.from(token);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function isAdmin() {
  const jar = await cookies();
  return validToken(jar.get(cookieName)?.value);
}

function expectedPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  if (process.env.NODE_ENV !== "production") return "admin";
  return null;
}

export function devPasswordHint() {
  return process.env.ADMIN_PASSWORD || process.env.NODE_ENV === "production" ? null : "admin";
}

export async function startSession(password: string) {
  const expected = expectedPassword();
  if (!expected) return { error: "Définissez ADMIN_PASSWORD dans .env.local." };
  const left = Buffer.from(password);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return { error: "Mot de passe incorrect." };
  }
  const jar = await cookies();
  jar.set(cookieName, sign("admin"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return { error: null };
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(cookieName);
}
