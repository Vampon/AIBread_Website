"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) { setError(result.error || "登录失败"); return; }
    router.push("/admin"); router.refresh();
  }

  return (
    <form onSubmit={submit} className="surface-card w-full max-w-md p-7 md:p-9">
      <p className="text-xs font-bold text-bread-700">网站后台</p><h1 className="mt-2 font-display text-3xl text-bread-900">管理员登录</h1>
      {!configured && <div className="mt-5 rounded-xl border border-bread-300 bg-bread-100 p-4 text-sm leading-6 text-bread-900">后台尚未启用。请在 <code>.env.local</code> 中设置 <code>ADMIN_PASSWORD</code>。</div>}
      <label className="mt-6 block text-xs font-bold text-bread-900">管理密码<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={!configured} className="mt-2 w-full rounded-xl border border-bread-900/10 bg-white px-4 py-3 text-sm outline-none focus:border-bread-500" placeholder="输入后台密码" /></label>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={!configured || loading} className="mt-6 w-full rounded-xl bg-bread-900 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{loading ? "登录中…" : "进入后台"}</button>
    </form>
  );
}
