import Image from "next/image";
import { ArrowUpRight, Check, Mail, MessageCircle, Sparkles } from "lucide-react";

export const metadata = { title: "关于我", description: "认识 AI面包君：一个持续学习、创造并分享 AI 的普通人。" };

const socials = [
  { label: "B 站", detail: "长视频与完整教程", href: "https://space.bilibili.com/3546609602267766" },
  { label: "抖音", detail: "一分钟 AI 小技巧", href: "https://www.douyin.com/user/MS4wLjABAAAA4XP2qKiH8LOaG5jjuincgnenQisFQHlya2mnl_vjIx8" },
  { label: "小红书", detail: "图文笔记与工具体验", href: "https://www.xiaohongshu.com/user/profile/6953b65a0000000037009210" },
];

const WECHAT_QR = "https://backend.appmiaoda.com/projects/supabase284891170281144320/storage/v1/object/public/prompts-icons/1772075980738_qrcode_for_gh_2084a3a9ae4e_344.jpg";

export default function AboutPage() {
  return (
    <>
      <section className="container-page pt-10 md:pt-14">
        <div className="relative overflow-hidden rounded-2xl bg-bread-900 px-7 py-10 text-white md:px-12 md:py-12">
          <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full bg-bread-500/20 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl"><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-bread-300"><Sparkles className="h-4 w-4" /> About the baker</p><h1 className="mt-5 font-display text-4xl leading-tight md:text-6xl">你好，我是 AI面包君。</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 md:text-base">我喜欢把复杂问题拆开、动手做出来，再用普通话讲明白。这里是我的作品、学习记录和长期更新的个人主页。</p></div>
            <div className="animate-bread-float flex h-36 w-36 items-center justify-center rounded-[38%_62%_45%_55%] bg-bread-500 text-7xl shadow-bread md:h-44 md:w-44">🍞</div>
          </div>
        </div>
      </section>

      <section className="container-page mt-12">
        <div className="grid gap-9 lg:grid-cols-[1.25fr_.75fr]">
          <article className="space-y-10">
            <div><p className="eyebrow">Why this site</p><h2 className="display-title mt-5 text-3xl md:text-4xl">为什么做这个网站</h2><div className="mt-6 space-y-5 text-base leading-8 text-bread-900/68"><p>AI 每天都在变，但大多数人真正缺的不是更多新闻，而是有人把变化筛一遍、试一遍，再说明白：<strong className="text-bread-900">它和我到底有什么关系？</strong></p><p>所以有了 AI面包君。这里既是我的个人主页，也是公开的学习记录。我会分享自己真正用过的工具、做过的项目和仍在摸索的问题。</p><p>我希望它像一家熟悉的小面包店：东西不一定最多，但每一份都认真做过，你也知道是谁做的。</p></div></div>
            <div><p className="eyebrow">My principles</p><h2 className="display-title mt-5 text-3xl md:text-4xl">我在意的三件事</h2><div className="mt-6 grid gap-3 sm:grid-cols-3">{["用人话讲清楚","用实践验证判断","不靠焦虑换关注"].map((item) => <div key={item} className="rounded-2xl border border-bread-900/10 bg-white p-5"><Check className="h-5 w-5 text-bread-600" /><p className="mt-5 text-sm font-bold text-bread-900">{item}</p></div>)}</div></div>
          </article>

          <aside className="space-y-5">
            <div className="surface-card p-6"><h3 className="font-bold text-bread-900">也可以在这里找到我</h3><div className="mt-4 space-y-2">{socials.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-xl border border-bread-900/8 px-4 py-3 hover:border-bread-400 hover:bg-bread-50"><span><strong className="block text-sm text-bread-900">{social.label}</strong><small className="text-xs text-bread-900/45">{social.detail}</small></span><ArrowUpRight className="h-4 w-4 text-bread-900/35 group-hover:text-bread-600" /></a>)}</div></div>
            <div id="wechat-qr" className="surface-card scroll-mt-28 p-6"><div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-bread-600" /><h3 className="font-bold text-bread-900">微信公众号</h3></div><p className="mt-2 text-xs text-bread-900/50">长文与新内容会优先在这里见面。</p><div className="mt-5 flex justify-center rounded-2xl bg-bread-50 p-4"><Image src={WECHAT_QR} alt="AI面包君微信公众号二维码" width={180} height={180} unoptimized className="h-44 w-44 rounded-xl" /></div></div>
          </aside>
        </div>
      </section>

      <section id="contact" className="container-page mt-14 scroll-mt-24 pb-6">
        <div className="grid gap-8 rounded-2xl border border-bread-900/10 bg-bread-100/65 p-7 md:grid-cols-[1fr_auto] md:items-center md:p-9">
          <div><p className="eyebrow">Say hello</p><h2 className="display-title mt-4 text-3xl md:text-4xl">有想法，欢迎聊聊。</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-bread-900/60">无论是内容建议、工具点子、AI 学习交流，还是有一件具体的事想一起研究，都可以通过上面的任意平台联系我。</p></div>
          <a href="#wechat-qr" className="inline-flex items-center justify-center gap-2 rounded-full bg-bread-900 px-6 py-3 text-sm font-bold text-white"><Mail className="h-4 w-4" /> 找到联系方式</a>
        </div>
      </section>
    </>
  );
}
