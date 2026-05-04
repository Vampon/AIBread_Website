import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Topic } from "@/data/topics";

export function TopicCard({ topic }: { topic: Topic }) {
  return (
    <Link
      href={`/blog?topic=${topic.slug}`}
      className="group relative flex overflow-hidden rounded-2xl border border-bread-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      <div className="relative h-auto w-2/5 overflow-hidden">
        <Image
          src={topic.cover}
          alt={topic.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 40vw, 240px"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="self-start rounded-full bg-bread-100 px-3 py-1 text-xs font-medium text-bread-700">
          {topic.tag} · {topic.lessons} 节
        </span>
        <h3 className="mt-3 text-lg font-bold text-bread-900 transition-colors group-hover:text-bread-600">
          {topic.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-bread-900/70">
          {topic.description}
        </p>
        <div className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-bread-700">
          进入专题
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
