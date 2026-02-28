import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  if (cookieStore.get("parent_mode")?.value !== "true") {
    return NextResponse.json({ error: "Parent authorization required" }, { status: 403 });
  }

  const { id } = await params;
  const { approve } = await request.json();

  const updated = await prisma.project.update({
    where: { id },
    data: {
      isShareApproved: Boolean(approve),
      shareToken: approve ? randomUUID() : null
    }
  });

  return NextResponse.json(updated);
}
