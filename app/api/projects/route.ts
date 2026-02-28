import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSafeObject } from "@/lib/safety";
import { templateSchemas } from "@/lib/templates";

export async function GET() {
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { templateType, title, dataJson } = body;

  if (!templateType || !templateSchemas[templateType as keyof typeof templateSchemas]) {
    return NextResponse.json({ error: "Invalid template type" }, { status: 400 });
  }

  const parseResult = templateSchemas[templateType as keyof typeof templateSchemas].safeParse(dataJson);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Template data is invalid", details: parseResult.error.flatten() }, { status: 400 });
  }

  const { sanitized, safetyFlags } = ensureSafeObject(parseResult.data);
  const safeTitle = ensureSafeObject(title).sanitized as string;

  const project = await prisma.project.create({
    data: {
      templateType,
      title: safeTitle,
      dataJson: sanitized,
      safetyFlags,
      isShareApproved: false
    }
  });

  return NextResponse.json(project, { status: 201 });
}
