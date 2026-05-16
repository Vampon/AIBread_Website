/**
 * 极简 markdown 渲染器（仅 /cc 模块用）。
 * 支持：段落、有/无序列表、**加粗**、`行内code`、[文字](url)。
 *
 * 与 src/lib/mini-md.tsx 不同点：
 * - 暗色配色（slate 系，配仿真器）
 * - [text](/blog/xxx) 内链走 next/link 同窗
 * - http(s) 外链才新窗
 *
 * 不支持图片 / 引用 / 表格 / 代码块——这些不该出现在原理面板的小卡片里。
 */

import React from "react";
import Link from "next/link";

function isInternal(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}

function inline(text: string, keyPrefix = "i"): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let rest = text;
  let k = 0;

  type Pattern = {
    re: RegExp;
    render: (m: RegExpExecArray) => React.ReactNode;
  };

  const patterns: Pattern[] = [
    {
      re: /`([^`]+)`/,
      render: (m) => (
        <code
          key={`${keyPrefix}-${k++}`}
          className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[0.88em] text-amber-200"
        >
          {m[1]}
        </code>
      ),
    },
    {
      re: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (m) => {
        const label = m[1];
        const url = m[2];
        const cls =
          "text-amber-300 underline decoration-amber-400/40 underline-offset-2 hover:text-amber-200 hover:decoration-amber-300";
        if (isInternal(url)) {
          return (
            <Link key={`${keyPrefix}-${k++}`} href={url} className={cls}>
              {label}
            </Link>
          );
        }
        return (
          <a
            key={`${keyPrefix}-${k++}`}
            href={url}
            target="_blank"
            rel="noreferrer"
            className={cls}
          >
            {label}
          </a>
        );
      },
    },
    {
      re: /\*\*([^*]+)\*\*/,
      render: (m) => (
        <strong
          key={`${keyPrefix}-${k++}`}
          className="font-semibold"
        >
          {m[1]}
        </strong>
      ),
    },
  ];

  while (rest.length > 0) {
    let earliest: { idx: number; len: number; node: React.ReactNode } | null = null;
    for (const p of patterns) {
      const m = p.re.exec(rest);
      if (m && (earliest === null || m.index < earliest.idx)) {
        earliest = { idx: m.index, len: m[0].length, node: p.render(m) };
      }
    }
    if (!earliest) {
      out.push(rest);
      break;
    }
    if (earliest.idx > 0) out.push(rest.slice(0, earliest.idx));
    out.push(earliest.node);
    rest = rest.slice(earliest.idx + earliest.len);
  }
  return out;
}

export function ExplainerMd({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const lines = text.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let buf: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];
  let bk = 0;

  const flushP = () => {
    if (buf.length === 0) return;
    blocks.push(
      <p key={`p-${bk++}`} className="leading-7">
        {inline(buf.join(" "))}
      </p>
    );
    buf = [];
  };

  const flushList = () => {
    if (!listType) return;
    const Tag = listType;
    blocks.push(
      <Tag
        key={`l-${bk++}`}
        className={`${
          listType === "ul" ? "list-disc" : "list-decimal"
        } space-y-1.5 pl-6 leading-7 marker:text-slate-500`}
      >
        {listItems.map((it, i) => (
          <li key={i}>{inline(it, `li-${i}`)}</li>
        ))}
      </Tag>
    );
    listType = null;
    listItems = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line === "") {
      flushP();
      flushList();
      continue;
    }
    const ulMatch = /^[-*]\s+(.*)$/.exec(line);
    const olMatch = /^\d+\.\s+(.*)$/.exec(line);
    if (ulMatch) {
      flushP();
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listItems.push(ulMatch[1]);
      continue;
    }
    if (olMatch) {
      flushP();
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      listItems.push(olMatch[1]);
      continue;
    }
    flushList();
    buf.push(line);
  }
  flushP();
  flushList();

  return (
    <div className={`space-y-3 text-sm leading-7 ${className}`}>{blocks}</div>
  );
}
