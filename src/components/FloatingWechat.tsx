"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";

const QR_URL =
  "https://backend.appmiaoda.com/projects/supabase284891170281144320/storage/v1/object/public/prompts-icons/1772075980738_qrcode_for_gh_2084a3a9ae4e_344.jpg";

export function FloatingWechat() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // 关卡页右下角已经被进度栏占用，避免互相遮挡
  if (pathname?.startsWith("/learn/") && pathname !== "/learn") return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3"
      onMouseLeave={() => setOpen(false)}
    >
      {open && (
        <div className="origin-bottom-right rounded-2xl border border-bread-200 bg-white p-3 shadow-lg">
          <div className="rounded-xl border border-bread-100 bg-bread-50 p-2">
            <Image
              src={QR_URL}
              alt="AI面包君 微信公众号 二维码"
              width={180}
              height={180}
              unoptimized
              className="h-40 w-40 rounded-lg"
              priority={false}
            />
          </div>
          <div className="mt-2 text-center text-[11px] font-medium text-bread-900/70">
            扫码关注「AI面包君」
          </div>
        </div>
      )}
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "关闭微信二维码" : "查看微信公众号二维码"}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
        {!open && (
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-bread-900 px-3 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
            微信公众号
          </span>
        )}
      </button>
    </div>
  );
}
