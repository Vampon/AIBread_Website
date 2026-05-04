/**
 * 兼容层：旧代码 import "@/data/articles"，现在数据来自 markdown 文件。
 * 真正的实现在 @/lib/articles。新代码请直接 import @/lib/articles。
 */
export type { Article } from "@/lib/articles";
export { getAllArticles, getArticleBySlug, getAllTags } from "@/lib/articles";

import { getAllArticles, getAllTags } from "@/lib/articles";

export const articles = getAllArticles();
export const articleTags = getAllTags();
