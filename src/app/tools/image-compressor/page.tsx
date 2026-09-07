import { ToolShell } from "@/components/tools/ToolShell";
import { ImageWorkbench } from "@/components/tools/ImageWorkbench";

export const metadata = { title: "图片压缩", description: "在浏览器本地调整图片尺寸和质量，导出更小的 PNG、JPG 或 WebP。" };

export default function ImageCompressorPage() { return <ToolShell icon="/tools/icons/image-compressor.png" title="图片压缩" description="调整最长边和输出质量，对比压缩前后的体积，再下载结果。图片不会离开你的浏览器。"><ImageWorkbench mode="compress" /></ToolShell>; }
