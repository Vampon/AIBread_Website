import { ToolShell } from "@/components/tools/ToolShell";
import { ImageWorkbench } from "@/components/tools/ImageWorkbench";

export const metadata = { title: "图片格式转换", description: "在浏览器本地把图片转换成 PNG、JPG 或 WebP。" };

export default function ImageConverterPage() { return <ToolShell icon="/tools/icons/image-converter.png" title="图片格式转换" description="选择一张图片，转换成 PNG、JPG 或 WebP。透明图片转成 JPG 时会自动铺上白色背景。"><ImageWorkbench mode="convert" /></ToolShell>; }
