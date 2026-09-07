import { WorkGallery } from "@/components/WorkGallery";
import { getProjects } from "@/lib/projects";

export const metadata = { title: "作品", description: "AI面包君做过的 AI 工具、互动课程与小游戏。" };
export const revalidate = 300;

export default async function WorkPage() {
  const projects = await getProjects();
  return (
    <>
      <section className="container-page">
        <div className="page-intro">
          <div><p className="eyebrow">My work</p><h1 className="display-title mt-4 text-4xl md:text-6xl">我用 AI 做的东西</h1></div>
          <p className="max-w-lg text-sm leading-7 text-bread-900/62">网站、工具和互动课程都放在这里。能直接用的给了入口，制作笔记也挂在卡片下面。</p>
        </div>
      </section>
      <section className="container-page mt-7 pb-8"><WorkGallery projects={projects} /></section>
    </>
  );
}
