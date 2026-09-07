import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  FolderKanban,
  Mail,
  MessageCircle,
  Newspaper,
} from "lucide-react";

export const metadata = {
  title: "关于我",
  description: "认识 AI面包君：哈工大计算学部硕士、人工智能算法研究背景，以及在制造业推动 AI 落地的实践者。",
};

const socials = [
  { label: "B 站", detail: "视频教程和完整演示", href: "https://space.bilibili.com/3546609602267766" },
  { label: "抖音", detail: "短一些的 AI 使用技巧", href: "https://www.douyin.com/user/MS4wLjABAAAA4XP2qKiH8LOaG5jjuincgnenQisFQHlya2mnl_vjIx8" },
  { label: "小红书", detail: "图文笔记和工具体验", href: "https://www.xiaohongshu.com/user/profile/6953b65a0000000037009210" },
];

const siteContents = [
  { icon: FolderKanban, title: "做过的东西", text: "自己开发的工具、网站和一些还在打磨的实验。" },
  { icon: BookOpen, title: "讲得完整的课", text: "把 Agent、MCP、RAG 等主题拆开，从能运行的第一步讲起。" },
  { icon: Newspaper, title: "随手记下的文章", text: "项目复盘、工具体验，以及我对 AI 落地的一些判断。" },
];

const WECHAT_QR = "https://backend.appmiaoda.com/projects/supabase284891170281144320/storage/v1/object/public/prompts-icons/1772075980738_qrcode_for_gh_2084a3a9ae4e_344.jpg";

export default function AboutPage() {
  return (
    <>
      <section className="container-page pt-10 md:pt-14">
        <div className="grid overflow-hidden rounded-2xl border border-bread-900/10 bg-white shadow-soft lg:grid-cols-[390px_minmax(0,1fr)]">
          <div className="relative flex items-center justify-center border-b border-bread-900/10 bg-bread-100/55 p-5 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="relative aspect-[15/13] w-full max-w-[360px] overflow-hidden rounded-xl">
              <Image
                src="/town/ui-v6/portrait-card.png"
                alt="穿着未来外套、正在挥手的像素面包君"
                fill
                priority
                unoptimized
                className="object-contain"
                sizes="(max-width: 1024px) 360px, 330px"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center p-7 md:p-10 lg:p-12">
            <p className="eyebrow">关于我</p>
            <h1 className="display-title mt-5 text-4xl md:text-6xl">你好，我是 AI面包君。</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-bread-900/68">
              我硕士毕业于哈尔滨工业大学计算学部，研究方向是人工智能算法。现在在一家制造型企业做 FDE 工程师，主要在真实业务现场里研究一件事：怎么让 AI 真正帮上忙。
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-bread-900/58">
              从算法研究走到工程落地，我做过不少尝试，也踩过不少坑。这个网站就是我整理经验的地方——有做出来的工具，也有我愿意从头讲清楚的课程和文章。
            </p>

          </div>
        </div>
      </section>

      <section className="container-page mt-14">
        <div className="grid gap-9 lg:grid-cols-[minmax(0,1.25fr)_360px]">
          <div className="space-y-14">
            <article>
              <p className="eyebrow">我为什么开始分享</p>
              <h2 className="display-title mt-5 text-3xl md:text-4xl">把真实场景里的经验留下来</h2>
              <div className="mt-6 max-w-4xl space-y-5 text-base leading-8 text-bread-900/68">
                <p>在企业里做 AI，和看演示视频是两回事。模型效果只是其中一部分，还要面对业务流程、数据质量、系统接口，以及真正使用它的人。</p>
                <p>这些工作让我积累了不少一线经验。我想把其中可以公开、可以复用的部分整理出来，让刚开始接触 AI 的人少绕一点路，也让已经在做项目的人能找到一些参考。</p>
                <p>现在确实是一个很难得的窗口期。我不觉得每个人都必须去研究算法，但值得尽早开始动手：先用 AI 解决一个手边的具体问题，再慢慢把能力长出来。<strong className="text-bread-900">机会通常不是等来的，而是在做事的过程中被看见的。</strong></p>
              </div>
            </article>

            <article>
              <p className="eyebrow">这个网站会放什么</p>
              <h2 className="display-title mt-5 text-3xl md:text-4xl">我正在做，也会持续更新</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {siteContents.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-bread-900/10 bg-white p-5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bread-100 text-bread-700"><Icon className="h-5 w-5" /></span>
                      <h3 className="mt-5 text-sm font-bold text-bread-900">{item.title}</h3>
                      <p className="mt-2 text-xs leading-6 text-bread-900/52">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </article>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="surface-card p-6">
              <h2 className="font-bold text-bread-900">其他平台</h2>
              <p className="mt-2 text-xs leading-5 text-bread-900/48">不同平台会发不同形式的内容。</p>
              <div className="mt-4 space-y-2">
                {socials.map((social) => (
                  <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-xl border border-bread-900/10 px-4 py-3 hover:border-bread-400 hover:bg-bread-50">
                    <span><strong className="block text-sm text-bread-900">{social.label}</strong><small className="text-xs text-bread-900/45">{social.detail}</small></span>
                    <ArrowUpRight className="h-4 w-4 text-bread-900/35 group-hover:text-bread-600" />
                  </a>
                ))}
              </div>
            </div>

            <div id="wechat-qr" className="surface-card scroll-mt-28 p-6">
              <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-bread-600" /><h2 className="font-bold text-bread-900">微信公众号</h2></div>
              <p className="mt-2 text-xs text-bread-900/50">长文章和网站更新会优先发在这里。</p>
              <div className="mt-5 flex justify-center rounded-2xl bg-bread-50 p-4"><Image src={WECHAT_QR} alt="AI面包君微信公众号二维码" width={180} height={180} unoptimized className="h-44 w-44 rounded-xl" /></div>
            </div>
          </aside>
        </div>
      </section>

      <section id="contact" className="container-page mt-14 scroll-mt-24 pb-6">
        <div className="grid gap-7 rounded-2xl border border-bread-900/10 bg-bread-100/65 p-7 md:grid-cols-[1fr_auto] md:items-center md:p-9">
          <div>
            <p className="eyebrow">联系我</p>
            <h2 className="display-title mt-4 text-3xl md:text-4xl">有具体问题，欢迎来聊。</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-bread-900/60">工具使用、AI 学习、企业里的落地问题，或者你正在做一个有意思的项目，都可以通过上面的平台找到我。</p>
          </div>
          <a href="#wechat-qr" className="inline-flex items-center justify-center gap-2 rounded-full bg-bread-900 px-6 py-3 text-sm font-bold text-white hover:bg-bread-800"><Mail className="h-4 w-4" /> 查看联系方式 <ArrowRight className="h-4 w-4" /></a>
        </div>
      </section>
    </>
  );
}
