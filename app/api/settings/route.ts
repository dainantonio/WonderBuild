import { NextRequest, NextResponse } from "next/server";
import { AgeBand } from "@prisma/client";
import { getOrCreateProfile } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await getOrCreateProfile();
  return NextResponse.json(profile);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const profile = await getOrCreateProfile();

  const ageBand = Object.values(AgeBand).includes(body.ageBand) ? body.ageBand : profile.ageBand;
  const allowedCategories = Array.isArray(body.allowedCategories) ? body.allowedCategories : profile.allowedCategories;

  const updated = await prisma.userProfile.update({
    where: { id: profile.id },
    data: {
      ageBand,
      allowedCategories
    }
  });

  return NextResponse.json(updated);
}
