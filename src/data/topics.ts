export type Topic = {
  slug: string;
  title: string;
  description: string;
  cover: string;
  lessons: number;
  tag: string;
};

export const topics: Topic[] = [
  {
    slug: "ai-101",
    title: "AI 入门 30 讲",
    description: "从「AI 是什么」讲到「怎么用」，0 基础友好，每节 5 分钟。",
    cover: "/placeholders/cover-5.svg",
    lessons: 30,
    tag: "入门",
  },
  {
    slug: "prompt-master",
    title: "提示词修炼手册",
    description: "把 AI 用得像私人助理，关键就在提示词。一周从青铜到王者。",
    cover: "/placeholders/cover-2.svg",
    lessons: 18,
    tag: "进阶",
  },
  {
    slug: "ai-at-work",
    title: "AI 改造你的工作流",
    description: "邮件、PPT、报表、会议纪要…把 AI 织进每天的工作里。",
    cover: "/placeholders/cover-6.svg",
    lessons: 24,
    tag: "实战",
  },
];
