import { BlogList } from "@/components/BlogList";
import { getAllTags, getRegularArticles } from "@/lib/articles";

export const metadata = {
  title: "博客",
  description: "AI 工具、编程与真实项目实践文章，每篇都可以独立阅读。",
};

export default function BlogPage() {
  const articles = getRegularArticles();
  const tags = getAllTags();

  return (
    <>
      <section className="container-page">
        <div className="page-intro">
          <div>
            <p className="eyebrow">Learn & read</p>
            <h1 className="display-title mt-4 text-4xl md:text-6xl">博客</h1>
          </div>
          <p className="max-w-lg text-sm leading-7 text-bread-900/62">
            写我真正做过的事，也记下踩过的坑。需要解决某个具体问题时，可以从分类或搜索开始找。
          </p>
        </div>
      </section>

      <BlogList articles={articles} tags={tags} />
    </>
  );
}
