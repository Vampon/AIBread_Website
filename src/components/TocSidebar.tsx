"use client";

import { useEffect, useState } from "react";

type Item = { level: 2 | 3; text: string; id: string };

export function TocSidebar({ items }: { items: Item[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;
    const observers: IntersectionObserver[] = [];
    const idToVisible = new Map<string, boolean>();
    let current = items[0].id;

    const handler = () => {
      // 选 viewport 中"最早"可见的标题
      for (const it of items) {
        if (idToVisible.get(it.id)) {
          current = it.id;
          break;
        }
      }
      setActiveId(current);
    };

    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (!el) return;
      const ob = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => idToVisible.set(it.id, e.isIntersecting));
          handler();
        },
        { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
      );
      ob.observe(el);
      observers.push(ob);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="目录" className="text-xs">
      <div className="mb-4 font-bold text-bread-900">
        文章大纲
      </div>
      <ul className="space-y-1 border-l border-bread-900/10 pl-3">
        {items.map((it) => {
          const active = it.id === activeId;
          return (
            <li
              key={it.id}
              className={it.level === 3 ? "pl-3" : ""}
            >
              <a
                href={`#${it.id}`}
                className={`block rounded-md px-2 py-1.5 leading-5 transition-colors ${
                  active
                    ? "bg-bread-100 font-bold text-bread-700"
                    : "text-bread-900/48 hover:bg-bread-50 hover:text-bread-700"
                }`}
              >
                {it.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
