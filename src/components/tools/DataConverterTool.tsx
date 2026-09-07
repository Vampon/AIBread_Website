"use client";

import { useRef, useState } from "react";
import { ArrowLeftRight, Check, Clipboard, Download, FileUp } from "lucide-react";

type Direction = "csv-json" | "json-csv";

export function DataConverterTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [direction, setDirection] = useState<Direction>("csv-json");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function switchDirection() { setDirection((value) => value === "csv-json" ? "json-csv" : "csv-json"); setInput(output); setOutput(""); setError(""); }
  function convert() {
    try { setOutput(direction === "csv-json" ? JSON.stringify(csvToObjects(input), null, 2) : objectsToCsv(JSON.parse(input))); setError(""); }
    catch (cause) { setOutput(""); setError(cause instanceof Error ? cause.message : "转换失败，请检查内容。" ); }
  }
  async function copy() { if (!output) return; await navigator.clipboard.writeText(output); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
  function download() { if (!output) return; const ext = direction === "csv-json" ? "json" : "csv"; const type = ext === "json" ? "application/json" : "text/csv;charset=utf-8"; const url = URL.createObjectURL(new Blob([ext === "csv" ? `\uFEFF${output}` : output], { type })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `converted.${ext}`; anchor.click(); URL.revokeObjectURL(url); }
  async function loadFile(file?: File) { if (!file) return; setInput(await file.text()); setOutput(""); setError(""); }

  const from = direction === "csv-json" ? "CSV" : "JSON"; const to = direction === "csv-json" ? "JSON" : "CSV";
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-bread-900 bg-white shadow-[5px_6px_0_rgba(31,22,17,.12)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bread-900/10 bg-bread-100/55 px-4 py-3"><div className="flex items-center gap-3"><strong className="text-sm text-bread-900">{from}</strong><button onClick={switchDirection} className="flex h-9 w-9 items-center justify-center rounded-full border border-bread-900/15 bg-white text-bread-900 hover:border-bread-500" aria-label="交换转换方向"><ArrowLeftRight className="h-4 w-4" /></button><strong className="text-sm text-bread-900">{to}</strong></div><div className="flex gap-2"><button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-bread-900/15 bg-white px-3 py-2 text-xs font-bold text-bread-900"><FileUp className="h-3.5 w-3.5" />打开文件</button><input ref={inputRef} type="file" accept=".csv,.json,text/csv,application/json" className="sr-only" onChange={(event) => loadFile(event.target.files?.[0])} /><button onClick={convert} className="rounded-lg bg-bread-900 px-4 py-2 text-xs font-bold text-white">开始转换</button></div></div>
      <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-bread-900/10"><label className="min-w-0"><span className="flex h-11 items-center border-b border-bread-900/10 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-bread-900/40">输入 {from}</span><textarea value={input} onChange={(event) => { setInput(event.target.value); setError(""); }} spellCheck={false} placeholder={direction === "csv-json" ? "name,role\n面包君,开发者" : '[{"name":"面包君","role":"开发者"}]'} className="min-h-[480px] w-full resize-y bg-[#FFFEFA] p-5 font-mono text-[13px] leading-6 text-bread-900 outline-none placeholder:text-bread-900/25" /></label><div className="min-w-0"><div className="flex h-11 items-center justify-between border-b border-bread-900/10 px-4"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-bread-900/40">输出 {to}</span><div className="flex gap-1"><button onClick={copy} disabled={!output} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-bold text-bread-900/55 hover:bg-bread-100 disabled:opacity-25">{copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}{copied ? "已复制" : "复制"}</button><button onClick={download} disabled={!output} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-bold text-bread-900/55 hover:bg-bread-100 disabled:opacity-25"><Download className="h-3.5 w-3.5" />下载</button></div></div><textarea value={output} readOnly spellCheck={false} placeholder="转换结果会显示在这里" className="min-h-[480px] w-full resize-y bg-white p-5 font-mono text-[13px] leading-6 text-bread-900 outline-none placeholder:text-bread-900/25" /></div></div>
      <div className="min-h-12 border-t border-bread-900/10 px-4 py-3 text-xs">{error ? <p role="alert" className="font-bold text-red-700">{error}</p> : <p className="text-bread-900/38">支持带引号、逗号和换行的 CSV；第一行会作为字段名。</p>}</div>
    </div>
  );
}

function parseCsv(source: string) {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let index = 0; index < source.length; index++) { const char = source[index]; if (quoted) { if (char === '"' && source[index + 1] === '"') { cell += '"'; index++; } else if (char === '"') quoted = false; else cell += char; } else if (char === '"') quoted = true; else if (char === ',') { row.push(cell); cell = ""; } else if (char === '\n') { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; } else cell += char; }
  if (quoted) throw new Error("CSV 中有一个引号没有闭合。");
  if (cell || row.length) { row.push(cell.replace(/\r$/, "")); rows.push(row); }
  return rows.filter((item) => item.some((value) => value.trim() !== ""));
}
function csvToObjects(source: string) { const rows = parseCsv(source); if (rows.length < 2) throw new Error("CSV 至少需要表头和一行数据。" ); const headers = rows[0].map((value, index) => value.replace(/^\uFEFF/, "").trim() || `column_${index + 1}`); return rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]))); }
function objectsToCsv(value: unknown) { if (!Array.isArray(value) || value.length === 0 || value.some((item) => !item || typeof item !== "object" || Array.isArray(item))) throw new Error("JSON 需要是一个非空的对象数组。" ); const records = value as Record<string, unknown>[]; const headers = Array.from(new Set(records.flatMap((item) => Object.keys(item)))); const encode = (item: unknown) => { const text = item == null ? "" : typeof item === "object" ? JSON.stringify(item) : String(item); return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }; return [headers.join(","), ...records.map((record) => headers.map((header) => encode(record[header])).join(","))].join("\n"); }
