import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export function ToolShell({ icon, title, description, children }: { icon: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="container-page py-8 md:py-12">
      <Link href="/work" className="inline-flex items-center gap-2 text-xs font-bold text-bread-900/52 hover:text-bread-900"><ArrowLeft className="h-3.5 w-3.5" />返回作品</Link>
      <header className="mt-7 grid gap-6 border-b-2 border-bread-900 pb-7 md:grid-cols-[112px_1fr_auto] md:items-center">
        <span className="flex h-28 w-28 items-center justify-center rounded-[22px] border-2 border-bread-900 bg-white shadow-[4px_4px_0_#F3B83F]"><Image src={icon} alt="" width={96} height={96} className="h-24 w-24 object-contain [image-rendering:pixelated]" unoptimized priority /></span>
        <div><p className="page-kicker">Bread toolbox</p><h1 className="mt-3 text-3xl font-black tracking-tight text-bread-900 md:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-bread-900/58">{description}</p></div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2C7468]/20 bg-[#E0F1EC] px-3 py-2 text-[11px] font-bold text-[#27685E]"><ShieldCheck className="h-4 w-4" />只在本地处理</span>
      </header>
      <section className="mt-7">{children}</section>
    </main>
  );
}
