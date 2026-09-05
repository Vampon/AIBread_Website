import { NextResponse } from "next/server";
import { ADMIN_COOKIE, getAdminSessionToken, isAdminConfigured, verifyAdminPassword } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAdminConfigured()) return NextResponse.json({ error: "请先在 .env.local 中设置 ADMIN_PASSWORD" }, { status: 503 });
  const body = await request.json().catch(() => ({})) as { password?: string };
  if (!verifyAdminPassword(body.password || "")) return NextResponse.json({ error: "密码不正确" }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, getAdminSessionToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 12, path: "/" });
  return response;
}
