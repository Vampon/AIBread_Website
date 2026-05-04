"use client";

import { useEffect, useState } from "react";
import {
  loadProgress,
  emptyProgress,
  PROGRESS_EVENT,
  type Progress,
} from "./progress";

/**
 * 客户端 hook：读 localStorage 里的进度，并监听跨标签 / 同标签变更事件。
 * SSR 期间返回空进度，避免水合错误（首屏一闪空状态后立刻刷新到真实值）。
 */
export function useProgress(): Progress {
  const [progress, setProgress] = useState<Progress>(emptyProgress);

  useEffect(() => {
    setProgress(loadProgress());
    const refresh = () => setProgress(loadProgress());
    window.addEventListener("storage", refresh);
    window.addEventListener(PROGRESS_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(PROGRESS_EVENT, refresh);
    };
  }, []);

  return progress;
}
