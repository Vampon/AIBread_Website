import Link from "next/link";
import Image from "next/image";
import { Mail, Sparkles } from "lucide-react";

const socials = [
  {
    label: "B 站",
    handle: "AI面包君",
    href: "https://space.bilibili.com/3546609602267766",
    desc: "长视频教程为主",
    external: true,
  },
  {
    label: "抖音",
    handle: "AI面包君",
    href: "https://www.douyin.com/user/MS4wLjABAAAA4XP2qKiH8LOaG5jjuincgnenQisFQHlya2mnl_vjIx8",
    desc: "1 分钟 AI 小技巧",
    external: true,
  },
  {
    label: "小红书",
    handle: "AI面包君",
    href: "https://www.xiaohongshu.com/user/profile/6953b65a0000000037009210",
    desc: "图文笔记 + 工具种草",
    external: true,
  },
  {
    label: "公众号",
    handle: "AI面包君",
    href: "#wechat-qr",
    desc: "周更长文，扫码下方二维码",
    external: false,
  },
];

const WECHAT_QR =
  "https://backend.appmiaoda.com/projects/supabase284891170281144320/storage/v1/object/public/prompts-icons/1772075980738_qrcode_for_gh_2084a3a9ae4e_344.jpg";

export default function AboutPage() {
  return (
    <>
      <section className="container-page pt-16 pb-10 md:pt-20">
        <div className="grid gap-10 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex h-40 w-40 items-center justify-center rounded-3xl bg-gradient-to-br from-bread-300 to-bread-500 text-7xl shadow-bread">
            🍞
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bread-100 px-3 py-1 text-xs font-medium text-bread-700">
              <Sparkles className="h-3.5 w-3.5" />
              关于 · ABOUT
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-bread-900 md:text-5xl">
              你好，我是 AI面包君
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-bread-900/70 md:text-lg">
              一个把 AI 嚼碎了、烤香了再喂给你的内容创作者。
            </p>
          </div>
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr]">
          <article className="space-y-5 text-base leading-loose text-bread-900/85">
            <h2 className="text-2xl font-bold text-bread-900">为什么做这个号</h2>
            <p>
              这两年 AI 火得一塌糊涂。但身边的朋友、家里的长辈，问起 AI 还是一脸茫然——
              「ChatGPT 不就是聊天机器人吗？」「我又不写代码，AI 跟我有啥关系？」
            </p>
            <p>
              其实 AI 早就不只是程序员的玩具了。它能帮你写邮件、改简历、做 PPT、规划旅行、辅导孩子作业…
              问题不在于 AI 难不难，而在于——
              <strong className="font-semibold text-bread-900">
                没人愿意用人话给普通人讲一遍
              </strong>
              。
            </p>
            <p>
              所以我做了 AI面包君。我的目标只有一个：
              <strong className="font-semibold text-bread-900">
                让一个完全没用过 AI 的人，看完我的内容能立刻上手。
              </strong>
            </p>

            <h2 className="pt-4 text-2xl font-bold text-bread-900">这里有什么</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong className="font-semibold text-bread-900">AI 工具评测</strong>
                ：每个工具我都自己用过，给你真实使用感受，不收广告费瞎吹。
              </li>
              <li>
                <strong className="font-semibold text-bread-900">提示词技巧</strong>
                ：把 AI 当朋友、当助理、当老师，怎么问它才能给你想要的答案。
              </li>
              <li>
                <strong className="font-semibold text-bread-900">真实使用案例</strong>
                ：周报、PPT、修图、翻译、辅导作业… 把 AI 织进每一天。
              </li>
              <li>
                <strong className="font-semibold text-bread-900">0 基础学习路径</strong>
                ：43 个小关卡，每关 5–10 分钟，从认识 AI 到熟练使用。
              </li>
            </ul>

            <h2 className="pt-4 text-2xl font-bold text-bread-900">我的承诺</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>不堆砌术语：能用「面包」类比的，绝不说「Transformer」。</li>
              <li>不收割焦虑：AI 是工具，不是判官。</li>
              <li>不刷屏式更新：每周 1–2 篇，每篇都对得起你的时间。</li>
            </ul>
          </article>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-bread-100 bg-white p-6">
              <h3 className="text-base font-bold text-bread-900">在这些平台找到我</h3>
              <ul className="mt-4 space-y-3">
                {socials.map((s) =>
                  s.external ? (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between rounded-xl border border-bread-100 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-bread-300 hover:bg-bread-50"
                      >
                        <div>
                          <div className="text-sm font-semibold text-bread-900">
                            {s.label}
                          </div>
                          <div className="text-xs text-bread-900/60">{s.desc}</div>
                        </div>
                        <span className="text-xs font-medium text-bread-700">
                          @{s.handle}
                        </span>
                      </a>
                    </li>
                  ) : (
                    <li key={s.label}>
                      <Link
                        href={s.href}
                        className="group flex items-center justify-between rounded-xl border border-bread-100 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-bread-300 hover:bg-bread-50"
                      >
                        <div>
                          <div className="text-sm font-semibold text-bread-900">
                            {s.label}
                          </div>
                          <div className="text-xs text-bread-900/60">{s.desc}</div>
                        </div>
                        <span className="text-xs font-medium text-bread-700">
                          {s.handle}
                        </span>
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div
              id="wechat-qr"
              className="scroll-mt-24 rounded-2xl border border-bread-200 bg-white p-6"
            >
              <h3 className="text-base font-bold text-bread-900">微信公众号</h3>
              <p className="mt-2 text-xs text-bread-900/60">
                扫一扫订阅，新内容第一时间推送。
              </p>
              <div className="mt-4 flex justify-center">
                <div className="rounded-2xl border border-bread-100 bg-bread-50 p-3">
                  <Image
                    src={WECHAT_QR}
                    alt="AI面包君 微信公众号 二维码"
                    width={200}
                    height={200}
                    unoptimized
                    className="h-44 w-44 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-bread-200 bg-gradient-to-br from-bread-100 to-bread-50 p-6">
              <h3 className="flex items-center gap-2 text-base font-bold text-bread-900">
                <Mail className="h-4 w-4" />
                合作 / 投稿建议
              </h3>
              <p className="mt-3 text-sm text-bread-900/70">
                广告合作、内容投稿、读者反馈，欢迎私信任意账号。
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
