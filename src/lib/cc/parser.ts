/**
 * 用户输入分发：决定走哪个 scenario。
 *
 * 优先级：
 * 1. slash 精确匹配（用户敲 `/help` → 走 help scenario，无视后面跟的内容）
 * 2. keywords 正则匹配（任一命中即用该 scenario）
 * 3. 都没命中 → 走 unknownScenario 兜底
 */

import { scenarios, unknownScenario } from "@/data/cc/scenarios";
import type { ParseResult, Scenario } from "./types";

export function parse(input: string): ParseResult {
  const text = input.trim();
  if (!text) {
    // 空输入也算 /help
    const help = scenarios.find((s) => s.id === "help");
    if (help) return { hit: true, scenario: help };
    return { hit: false, fallback: unknownScenario };
  }

  // 1) slash 精确
  if (text.startsWith("/")) {
    const head = text.split(/\s+/)[0].toLowerCase();
    for (const s of scenarios) {
      const slashes = s.triggers.slash;
      if (slashes && slashes.some((cmd) => cmd.toLowerCase() === head)) {
        return { hit: true, scenario: s };
      }
    }
    // slash 没命中也走 fallback（避免 `/banana` 被 keyword 误命中）
    return { hit: false, fallback: unknownScenario };
  }

  // 2) keyword 模糊
  for (const s of scenarios) {
    const kws = s.triggers.keywords;
    if (kws && kws.some((re) => re.test(text))) {
      return { hit: true, scenario: s };
    }
  }

  return { hit: false, fallback: unknownScenario };
}

/** 给 UI 提示词补全用：列出当前可用的 slash 命令 */
export function listSlashCommands(): Array<{ cmd: string; title: string }> {
  const out: Array<{ cmd: string; title: string }> = [];
  for (const s of scenarios) {
    if (s.triggers.slash) {
      for (const cmd of s.triggers.slash) {
        out.push({ cmd, title: s.title });
      }
    }
  }
  return out;
}

export function resolveScenario(result: ParseResult): Scenario {
  return result.hit ? result.scenario : result.fallback;
}
