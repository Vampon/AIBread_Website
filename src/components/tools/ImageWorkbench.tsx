"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, ImageIcon, RotateCcw, Upload } from "lucide-react";

type Mode = "compress" | "convert";
type Result = { url: string; blob: Blob; width: number; height: number };

const formatOptions = [
  { value: "image/webp", label: "WebP", ext: "webp" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
  { value: "image/png", label: "PNG", ext: "png" },
];

export function ImageWorkbench({ mode }: { mode: Mode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [format, setFormat] = useState(mode === "compress" ? "image/webp" : "image/png");
  const [quality, setQuality] = useState(82);
  const [maxDimension, setMaxDimension] = useState(1920);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); }, [sourceUrl]);
  useEffect(() => () => { if (result?.url) URL.revokeObjectURL(result.url); }, [result]);

  const reduction = useMemo(() => {
    if (!file || !result) return null;
    return Math.round((1 - result.blob.size / file.size) * 100);
  }, [file, result]);

  function choose(next: File | undefined) {
    if (!next) return;
    if (!next.type.startsWith("image/")) { setError("请选择 PNG、JPG 或 WebP 图片。"); return; }
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (result?.url) URL.revokeObjectURL(result.url);
    setFile(next); setSourceUrl(URL.createObjectURL(next)); setResult(null); setError("");
  }

  function reset() {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (result?.url) URL.revokeObjectURL(result.url);
    setFile(null); setSourceUrl(""); setResult(null); setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function run() {
    if (!file) return;
    setBusy(true); setError("");
    try {
      const next = await transformImage(file, format, quality / 100, mode === "compress" ? maxDimension : 0);
      if (result?.url) URL.revokeObjectURL(result.url);
      setResult(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "图片处理失败，请换一张图片再试。" );
    } finally { setBusy(false); }
  }

  const option = formatOptions.find((item) => item.value === format)!;
  const baseName = file?.name.replace(/\.[^.]+$/, "") || "aibread-image";

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-bread-900/12 bg-white p-5 lg:sticky lg:top-24">
        <h2 className="text-base font-bold text-bread-900">处理设置</h2>
        <label className="mt-5 block text-xs font-bold text-bread-900/62">输出格式<select value={format} onChange={(event) => { setFormat(event.target.value); setResult(null); }} className="mt-2 w-full rounded-lg border border-bread-900/15 bg-bread-50 px-3 py-2.5 text-sm text-bread-900 outline-none focus:border-bread-500">{formatOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        {mode === "compress" && <label className="mt-5 block text-xs font-bold text-bread-900/62">最长边<select value={maxDimension} onChange={(event) => { setMaxDimension(Number(event.target.value)); setResult(null); }} className="mt-2 w-full rounded-lg border border-bread-900/15 bg-bread-50 px-3 py-2.5 text-sm text-bread-900 outline-none focus:border-bread-500"><option value={0}>保持原尺寸</option><option value={1280}>1280 px</option><option value={1920}>1920 px</option><option value={2560}>2560 px</option></select></label>}
        {format !== "image/png" && <label className="mt-5 block text-xs font-bold text-bread-900/62"><span className="flex items-center justify-between"><span>输出质量</span><b className="font-mono text-bread-700">{quality}%</b></span><input type="range" min="30" max="95" step="1" value={quality} onChange={(event) => { setQuality(Number(event.target.value)); setResult(null); }} className="mt-3 w-full accent-[#E6A91C]" /></label>}
        <button type="button" onClick={run} disabled={!file || busy} className="mt-6 w-full rounded-lg bg-bread-900 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-35">{busy ? "正在处理…" : mode === "compress" ? "开始压缩" : `转换成 ${option.label}`}</button>
        {file && <button type="button" onClick={reset} className="mt-2 flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-bread-900/48 hover:text-bread-900"><RotateCcw className="h-3.5 w-3.5" />换一张图片</button>}
      </aside>

      <div className="min-w-0">
        {!file ? (
          <label onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); choose(event.dataTransfer.files[0]); }} className="flex min-h-[430px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-bread-900/22 bg-white/70 px-6 text-center hover:border-bread-500 hover:bg-white">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bread-100 text-bread-700"><Upload className="h-7 w-7" /></span><strong className="mt-5 text-lg text-bread-900">拖一张图片到这里</strong><span className="mt-2 text-sm text-bread-900/45">或点击选择，支持 PNG、JPG、WebP</span><input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => choose(event.target.files?.[0])} />
          </label>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Preview title="原图" url={sourceUrl} meta={`${file.name} · ${formatBytes(file.size)}`} />
            {result ? <Preview title="处理后" url={result.url} meta={`${result.width} × ${result.height} · ${formatBytes(result.blob.size)}`} /> : <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-bread-900/18 bg-white/45 text-center"><ImageIcon className="h-7 w-7 text-bread-900/24" /><p className="mt-3 text-sm font-bold text-bread-900/45">设置好后开始处理</p></div>}
          </div>
        )}
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {result && <div className="mt-4 flex flex-col gap-4 rounded-2xl border-2 border-bread-900 bg-bread-100/60 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-bread-900">处理完成</p><p className="mt-1 text-xs text-bread-900/52">{mode === "compress" && reduction !== null ? (reduction >= 0 ? `体积减少 ${reduction}%` : `当前设置让文件增大 ${Math.abs(reduction)}%`) : `${formatBytes(file!.size)} → ${formatBytes(result.blob.size)}`}</p></div><a href={result.url} download={`${baseName}.${option.ext}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-bread-900 px-5 py-3 text-sm font-bold text-white"><Download className="h-4 w-4" />下载 {option.label}</a></div>}
      </div>
    </div>
  );
}

function Preview({ title, url, meta }: { title: string; url: string; meta: string }) {
  return <figure className="overflow-hidden rounded-2xl border border-bread-900/12 bg-white"><div className="flex min-h-[310px] items-center justify-center bg-[linear-gradient(45deg,#f1eadb_25%,transparent_25%),linear-gradient(-45deg,#f1eadb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1eadb_75%),linear-gradient(-45deg,transparent_75%,#f1eadb_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] p-4"><img src={url} alt={title} className="max-h-[420px] max-w-full object-contain" /></div><figcaption className="border-t border-bread-900/10 px-4 py-3"><strong className="text-xs text-bread-900">{title}</strong><p className="mt-1 truncate text-[10px] text-bread-900/42">{meta}</p></figcaption></figure>;
}

function transformImage(file: File, mime: string, quality: number, maxDimension: number): Promise<Result> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      const scale = maxDimension > 0 ? Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight)) : 1;
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) { reject(new Error("当前浏览器无法处理这张图片。")); return; }
      if (mime === "image/jpeg") { context.fillStyle = "#ffffff"; context.fillRect(0, 0, width, height); }
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => blob ? resolve({ url: URL.createObjectURL(blob), blob, width, height }) : reject(new Error("无法生成目标格式，请换一个输出格式。")), mime, quality);
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("图片读取失败，请确认文件没有损坏。")); };
    image.src = url;
  });
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}
