/**
 * 仿真 Claude Code 的虚拟项目文件树。
 * 所有"工具调用"读到的文件内容都来自这里，不碰真实 fs。
 *
 * 注意：fs-mutation phase 会通过 reducer 修改 state.virtualFs，
 * 所以这里只是 *初始* 树，不要在运行时 mutate 它。
 */

import type { VFsNode, VFsDir, VFsFile } from "./types";

const README_MD = `# 我的小工具

这是一个示例项目，用来演示 Claude Code 怎么读文件、改代码、跑命令。

## 用法

\`\`\`bash
npm install
npm run dev
\`\`\`

## 目录

- src/   源码
- dist/  构建产物
`;

const PACKAGE_JSON = `{
  "name": "my-tool",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}
`;

const INDEX_TS = `export function greet(name: string) {
  return \`Hello, \${name}!\`;
}
`;

const NOTE_MD = `# 随手笔记

- 周三前把首页改完
- 提示词那篇博客继续写
`;

export const initialVirtualFs: VFsNode = {
  kind: "dir",
  name: "my-tool",
  children: [
    { kind: "file", name: "README.md", content: README_MD },
    { kind: "file", name: "package.json", content: PACKAGE_JSON },
    {
      kind: "dir",
      name: "src",
      children: [
        { kind: "file", name: "index.ts", content: INDEX_TS },
        { kind: "file", name: "note.md", content: NOTE_MD },
      ],
    },
    {
      kind: "dir",
      name: "dist",
      children: [
        { kind: "file", name: "index.js", content: "// built file 1" },
        { kind: "file", name: "index.js.map", content: "// map 1" },
        { kind: "file", name: "chunks.js", content: "// built file 2" },
      ],
    },
  ],
};

// ---- 工具函数（reducer / parser 调用）-----------------------------------

function splitPath(path: string): string[] {
  return path
    .replace(/^[./\\]+/, "")
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean);
}

export function exists(root: VFsNode, path: string): boolean {
  return findNode(root, path) !== null;
}

export function readFile(root: VFsNode, path: string): string | null {
  const node = findNode(root, path);
  if (!node || node.kind !== "file") return null;
  return node.content;
}

export function findNode(root: VFsNode, path: string): VFsNode | null {
  const parts = splitPath(path);
  // 如果路径以根目录名开头，跳过它
  let cursor: VFsNode = root;
  let i = 0;
  if (parts[0] === root.name) i = 1;
  for (; i < parts.length; i++) {
    if (cursor.kind !== "dir") return null;
    const next = cursor.children.find((c) => c.name === parts[i]);
    if (!next) return null;
    cursor = next;
  }
  return cursor;
}

/**
 * 不可变删除：返回新的 VFsNode 副本，目标节点已被剔除。
 * 删除目标必须是相对根的路径（如 "dist" 或 "src/note.md"）。
 */
export function removePath(root: VFsNode, path: string): VFsNode {
  const parts = splitPath(path);
  if (parts.length === 0) return root;
  if (parts[0] === root.name) parts.shift();
  if (parts.length === 0) return root;

  function remove(node: VFsNode, depth: number): VFsNode {
    if (node.kind !== "dir") return node;
    const target = parts[depth];
    if (depth === parts.length - 1) {
      return {
        ...node,
        children: node.children.filter((c) => c.name !== target),
      };
    }
    return {
      ...node,
      children: node.children.map((c) =>
        c.name === target && c.kind === "dir" ? remove(c, depth + 1) : c
      ),
    };
  }
  return remove(root, 0);
}

/** 列目录，给 Glob 工具用 */
export function listAll(root: VFsNode, prefix = ""): string[] {
  const out: string[] = [];
  function walk(node: VFsNode, p: string) {
    const here = p ? `${p}/${node.name}` : node.name;
    if (node.kind === "file") {
      out.push(here);
    } else {
      for (const c of node.children) walk(c, here);
    }
  }
  walk(root, prefix);
  return out;
}

// 类型重导出，方便消费方少 import
export type { VFsDir, VFsFile, VFsNode };
