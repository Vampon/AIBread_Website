import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isAdminConfigured, isAdminRequest } from "@/lib/admin-auth";

export const metadata = { title: "后台登录" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminRequest()) redirect("/admin");
  return <section className="container-page flex min-h-[70vh] items-center justify-center py-16"><AdminLoginForm configured={isAdminConfigured()} /></section>;
}
