import { AdminProjectManager } from "@/components/admin/AdminProjectManager";
import { requireAdmin } from "@/lib/admin-auth";
import { getProjects, isDatabaseConfigured } from "@/lib/projects";

export const metadata = { title: "作品管理" };
export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  await requireAdmin();
  return <AdminProjectManager initialProjects={await getProjects()} databaseConfigured={isDatabaseConfigured()} />;
}
