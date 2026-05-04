/**
 * 极简 markdown 渲染器（关卡内文本用）
 * 支持：段落、列表(- *)、有序列表、**粗体**、*斜体*、`行内代码`、[link](url)
 * 不支持：图片、引用块、表格、代码块、嵌套
 *
 * 这样关卡作者可以用熟悉的 markdown 语法写讲解，又不用引入大依赖。
 * 博客详情页的完整 markdown 用 react-markdown 单独渲染。
 */

import React from "react";

function inline(text: string, keyPrefix = "i"): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let rest = text;
  let k = 0;
  // 优先级：行内代码 > 链接 > 粗体 > 斜体
  const patterns: Array<{
    re: RegExp;
    render: (m: RegExpExecArray) => React.ReactNode;
  }> = [
    {
      re: /`([^`]+)`/,
      render: (m) => (
        <code
          key={`${keyPrefix}-${k++}`}
          className="rounded bg-bread-100 px-1.5 py-0.5 font-mono text-[0.9em] text-bread-800"
        >
          {m[1]}
        </code>
      ),
    },
    {
      re: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (m) => (
        <a
          key={`${keyPrefix}-${k++}`}
          href={m[2]}
          target="_blank"
          rel="noreferrer"
          className="text-bread-700 underline decoration-bread-300 underline-offset-2 hover:text-bread-500"
        >
          {m[1]}
        </a>
      ),
    },
    {
      re: /\*\*([^*]+)\*\*/,
      render: (m) => (
        <strong key={`${keyPrefix}-${k++}`} className="font-semibold text-bread-900">
          {m[1]}
        </strong>
      ),
    },
    {
      re: /\*([^*]+)\*/,
      render: (m) => (
        <em key={`${keyPrefix}-${k++}`} className="italic">
          {m[1]}
        </em>
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

export function MiniMd({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let buf: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];
  let bk = 0;

  const flushParagraph = () => {
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
        } space-y-1 pl-6 leading-7`}
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
      flushParagraph();
      flushList();
      continue;
    }
    const ulMatch = /^[-*]\s+(.*)$/.exec(line);
    const olMatch = /^\d+\.\s+(.*)$/.exec(line);
    if (ulMatch) {
      flushParagraph();
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listItems.push(ulMatch[1]);
      continue;
    }
    if (olMatch) {
      flushParagraph();
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
  flushParagraph();
  flushList();

  return <div className={`space-y-3 text-sm text-bread-900/85 ${className}`}>{blocks}</div>;
}
