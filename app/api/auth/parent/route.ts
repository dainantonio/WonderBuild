import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getOrCreateProfile } from "@/lib/settings";

export async function POST(request: NextRequest) {
  const { pin } = await request.json();
  const profile = await getOrCreateProfile();

  const ok = await bcrypt.compare(pin, profile.parentPinHash);
  if (!ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("parent_mode", "true", { httpOnly: true, sameSite: "strict", path: "/" });
  return response;
}
