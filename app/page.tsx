import { prisma } from "@/lib/prisma";
import { KidBuildStudio } from "@/components/KidBuildStudio";

export default async function HomePage() {
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" } });

  return <KidBuildStudio initialProjects={projects as never} />;
}
