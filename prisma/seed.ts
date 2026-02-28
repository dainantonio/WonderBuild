import { PrismaClient, AgeBand, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("1234", 10);

  await prisma.userProfile.deleteMany();
  await prisma.project.deleteMany();

  await prisma.userProfile.create({
    data: {
      role: Role.PARENT,
      parentPinHash: hash,
      ageBand: AgeBand.AGE_9_12,
      allowedCategories: ["math", "reading", "science", "geography"]
    }
  });

  await prisma.project.createMany({
    data: [
      {
        templateType: "STORY",
        title: "Jungle Quest",
        dataJson: {
          title: "Jungle Quest",
          theme: "Adventure",
          readingLevel: "Easy",
          characters: ["Mia", "Rio the Parrot"],
          scenes: [
            { text: "Mia finds a map in the library.", choices: ["Follow map", "Ask teacher"] },
            { text: "A river blocks the path.", choices: ["Build a raft", "Look for bridge"] }
          ]
        },
        safetyFlags: []
      },
      {
        templateType: "QUIZ",
        title: "Space Quiz",
        dataJson: {
          topic: "Space",
          difficulty: "Medium",
          questions: [
            {
              q: "Which planet is known as the Red Planet?",
              choices: ["Mars", "Venus", "Saturn"],
              answerIndex: 0,
              explanation: "Mars has red iron-rich dust."
            }
          ]
        },
        safetyFlags: []
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
