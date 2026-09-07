import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { NEWS_CACHE_TAG, getNewsBundle } from "@/lib/news/curate";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  revalidateTag(NEWS_CACHE_TAG);
  const bundle = await getNewsBundle();
  const bySource = bundle.items.reduce<Record<string, number>>((counts, item) => {
    counts[item.source] = (counts[item.source] ?? 0) + 1;
    return counts;
  }, {});
  return NextResponse.json({
    ok: true,
    generatedAt: bundle.generatedAt,
    count: bundle.items.length,
    chineseCount: bundle.items.filter((item) => item.lang === "zh").length,
    bySource,
    failed: bundle.failedSources,
  });
}
