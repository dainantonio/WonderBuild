import { AgeBand, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getOrCreateProfile() {
  const existing = await prisma.userProfile.findFirst({ where: { role: Role.PARENT } });
  if (existing) {
    return existing;
  }

  return prisma.userProfile.create({
    data: {
      role: Role.PARENT,
      parentPinHash: "$2a$10$YxP91H4nWefN6P9huzM8kuvQiiBdy5vSh8By4C.9hFxP7eyQulwkW", // 1234
      ageBand: AgeBand.AGE_6_8,
      allowedCategories: ["math", "reading", "science"]
    }
  });
}
