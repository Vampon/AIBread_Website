import { ToolShell } from "@/components/tools/ToolShell";
import { DataConverterTool } from "@/components/tools/DataConverterTool";

export const metadata = { title: "CSV / JSON 转换", description: "在 CSV 表格数据与 JSON 对象数组之间互相转换。" };

export default function DataConverterPage() { return <ToolShell icon="/tools/icons/data-converter.png" title="CSV / JSON 转换" description="CSV 和 JSON 双向转换。可以粘贴内容，也可以直接打开本地文件，结果随时复制或下载。"><DataConverterTool /></ToolShell>; }
