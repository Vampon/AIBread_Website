import type { NewsItem } from "./types";

export type AICurator = (items: NewsItem[]) => Promise<NewsItem[]>;

export const aiCurator: AICurator = async (items) => items;
