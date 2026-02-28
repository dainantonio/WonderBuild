import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SharedProjectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const project = await prisma.project.findFirst({ where: { shareToken: token, isShareApproved: true } });

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl bg-slate-50 p-6">
      <h1 className="text-2xl font-bold text-night">Shared KidBuild Project</h1>
      <h2 className="mt-3 text-lg font-semibold">{project.title}</h2>
      <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm shadow-card">{JSON.stringify(project.dataJson, null, 2)}</pre>
    </main>
  );
}
