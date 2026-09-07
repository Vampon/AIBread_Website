"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, Download, Eraser, Minimize2, WandSparkles } from "lucide-react";

export function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const stats = useMemo(() => output ? countJson(output) : null, [output]);

  function format(compact = false) {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, compact ? 0 : indent)); setError("");
    } catch (cause) {
      setOutput(""); setError(explainJsonError(cause, input));
    }
  }

  async function copy() {
    if (!output) return;
    await navigator.clipboard.writeText(output); setCopied(true); window.setTimeout(() => setCopied(false), 1600);
  }

  function download() {
    if (!output) return;
    const url = URL.createObjectURL(new Blob([output], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "formatted.json"; anchor.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-bread-900 bg-white shadow-[5px_6px_0_rgba(31,22,17,.12)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bread-900/10 bg-bread-100/55 px-4 py-3">
        <div className="flex flex-wrap gap-2"><button onClick={() => format(false)} className="inline-flex items-center gap-2 rounded-lg bg-bread-900 px-4 py-2.5 text-xs font-bold text-white"><WandSparkles className="h-3.5 w-3.5" />格式化</button><button onClick={() => format(true)} className="inline-flex items-center gap-2 rounded-lg border border-bread-900/15 bg-white px-4 py-2.5 text-xs font-bold text-bread-900"><Minimize2 className="h-3.5 w-3.5" />压缩</button><button onClick={() => { setInput(""); setOutput(""); setError(""); }} className="inline-flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-bread-900/48 hover:text-bread-900"><Eraser className="h-3.5 w-3.5" />清空</button></div>
        <label className="text-xs font-bold text-bread-900/55">缩进<select value={indent} onChange={(event) => setIndent(Number(event.target.value))} className="ml-2 rounded-md border border-bread-900/15 bg-white px-2 py-1.5"><option value={2}>2 空格</option><option value={4}>4 空格</option></select></label>
      </div>
      <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-bread-900/10">
        <label className="min-w-0"><span className="flex h-11 items-center border-b border-bread-900/10 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-bread-900/40">输入 JSON</span><textarea value={input} onChange={(event) => { setInput(event.target.value); setError(""); }} spellCheck={false} placeholder={'粘贴 JSON，例如 {"name":"AI面包君"}'} className="min-h-[480px] w-full resize-y bg-[#FFFEFA] p-5 font-mono text-[13px] leading-6 text-bread-900 outline-none placeholder:text-bread-900/25" /></label>
        <div className="min-w-0"><div className="flex h-11 items-center justify-between border-b border-bread-900/10 px-4"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-bread-900/40">格式化结果</span><div className="flex gap-1"><button onClick={copy} disabled={!output} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-bold text-bread-900/55 hover:bg-bread-100 disabled:opacity-25">{copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}{copied ? "已复制" : "复制"}</button><button onClick={download} disabled={!output} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-bold text-bread-900/55 hover:bg-bread-100 disabled:opacity-25"><Download className="h-3.5 w-3.5" />下载</button></div></div><textarea value={output} readOnly spellCheck={false} placeholder="结果会显示在这里" className="min-h-[480px] w-full resize-y bg-white p-5 font-mono text-[13px] leading-6 text-bread-900 outline-none placeholder:text-bread-900/25" /></div>
      </div>
      <div className="flex min-h-12 flex-wrap items-center justify-between gap-3 border-t border-bread-900/10 px-4 py-3 text-xs">{error ? <p role="alert" className="font-bold text-red-700">{error}</p> : <p className="text-bread-900/38">不会上传或保存输入内容。</p>}{stats && <p className="font-mono text-[10px] text-bread-900/45">{stats.keys} 个键 · {stats.depth} 层 · {output.length} 字符</p>}</div>
    </div>
  );
}

function explainJsonError(cause: unknown, input: string) {
  const message = cause instanceof Error ? cause.message : "JSON 语法不正确";
  const match = message.match(/position\s+(\d+)/i);
  if (!match) return `无法解析：${message}`;
  const position = Number(match[1]); const before = input.slice(0, position); const line = before.split("\n").length; const column = position - before.lastIndexOf("\n");
  return `第 ${line} 行，第 ${column} 列附近有语法问题。`;
}

function countJson(source: string) {
  const value = JSON.parse(source); let keys = 0; let depth = 0;
  const walk = (item: unknown, level: number) => { depth = Math.max(depth, level); if (item && typeof item === "object") { const values = Array.isArray(item) ? item : Object.values(item); if (!Array.isArray(item)) keys += Object.keys(item).length; values.forEach((child) => walk(child, level + 1)); } };
  walk(value, 1); return { keys, depth };
}
