import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" } });

  return new NextResponse(JSON.stringify(projects, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=kidbuild-projects.json"
    }
  });
}
