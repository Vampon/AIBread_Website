import { ToolShell } from "@/components/tools/ToolShell";
import { JsonFormatterTool } from "@/components/tools/JsonFormatterTool";

export const metadata = { title: "JSON 格式化", description: "格式化、压缩和检查 JSON 数据。" };

export default function JsonFormatterPage() { return <ToolShell icon="/tools/icons/json-formatter.png" title="JSON 格式化" description="把凌乱的 JSON 排整齐，或压成一行；有语法问题时，会尽量告诉你出错的位置。"><JsonFormatterTool /></ToolShell>; }
