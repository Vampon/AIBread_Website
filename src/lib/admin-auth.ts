import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "aibread_admin";

function configuredPassword() { return process.env.ADMIN_PASSWORD || ""; }
function sessionToken() {
  const password = configuredPassword();
  const secret = process.env.ADMIN_SESSION_SECRET || "local-development-only";
  return password ? createHash("sha256").update(`${password}:${secret}`).digest("hex") : "";
}

export function isAdminConfigured() { return Boolean(configuredPassword()); }

export function verifyAdminPassword(password: string) {
  const expected = configuredPassword();
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdminRequest() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value || "";
  const expected = sessionToken();
  return Boolean(expected && token === expected);
}

export async function requireAdmin() {
  if (!(await isAdminRequest())) redirect("/admin/login");
}

export function getAdminSessionToken() { return sessionToken(); }
