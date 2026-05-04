import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  moreHref?: string;
  moreLabel?: string;
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  moreHref,
  moreLabel = "查看全部",
}: Props) {
  return (
    <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <span className="inline-block rounded-full bg-bread-100 px-3 py-1 text-xs font-medium text-bread-700">
            {eyebrow}
          </span>
        )}
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-bread-900 md:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-base text-bread-900/70">
            {description}
          </p>
        )}
      </div>
      {moreHref && (
        <Link
          href={moreHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-bread-700 transition-colors hover:text-bread-500"
        >
          {moreLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
