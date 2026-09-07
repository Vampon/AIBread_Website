import { PixelTown } from "@/components/town/PixelTown";
import { getRegularArticles } from "@/lib/articles";
import { getProjects } from "@/lib/projects";

export const revalidate = 300;

export default async function HomePage() {
  const articles = getRegularArticles().map(({ title, slug, tag }) => ({ title, slug, tag }));
  const projects = (await getProjects()).map(({ id, title, href, isExternal }) => ({ id, title, href, isExternal }));
  return <PixelTown articles={articles} projects={projects} />;
}
