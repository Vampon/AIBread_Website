"use client";

import React from "react";

/** 关卡里所有"消息块"的统一外壳：左侧导师 / 右侧用户。 */
export function Bubble({
  speaker = "tutor",
  label,
  children,
  width = "wide",
}: {
  speaker?: "tutor" | "user";
  label?: React.ReactNode;
  children: React.ReactNode;
  width?: "wide" | "full";
}) {
  const isUser = speaker === "user";
  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "flex-row-reverse" : ""
      } ${width === "full" ? "" : ""}`}
    >
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
          isUser
            ? "border-bread-300 bg-gradient-to-br from-bread-200 to-bread-300 text-base"
            : "border-bread-200 bg-gradient-to-br from-bread-100 to-white text-lg"
        }`}
      >
        {isUser ? "🙋" : "🍞"}
      </div>
      <div
        className={`${
          width === "wide" ? "max-w-[88%]" : "w-full"
        } rounded-2xl border px-4 py-3 ${
          isUser
            ? "border-bread-300 bg-bread-100/80"
            : "border-bread-200 bg-white"
        }`}
      >
        {label && (
          <div
            className={`mb-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              isUser
                ? "bg-bread-500 text-white"
                : "bg-bread-50 text-bread-700"
            }`}
          >
            {label}
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
