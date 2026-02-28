import { z } from "zod";

export const storySchema = z.object({
  title: z.string().min(2),
  theme: z.string().min(2),
  readingLevel: z.string().min(2),
  characters: z.array(z.string().min(1)).min(1),
  scenes: z
    .array(
      z.object({
        text: z.string().min(1),
        choices: z.array(z.string().min(1)).min(2)
      })
    )
    .min(1)
});

export const quizSchema = z.object({
  topic: z.string().min(2),
  difficulty: z.string().min(2),
  questions: z
    .array(
      z.object({
        q: z.string().min(1),
        choices: z.array(z.string().min(1)).min(2),
        answerIndex: z.number().int().nonnegative(),
        explanation: z.string().min(1)
      })
    )
    .min(1)
});

export const flashcardsSchema = z.object({
  subject: z.string().min(2),
  cards: z
    .array(
      z.object({
        front: z.string().min(1),
        back: z.string().min(1)
      })
    )
    .min(1)
});

export const miniGameSchema = z.object({
  duration: z.number().min(10).max(120),
  targetCount: z.number().min(3).max(50),
  theme: z.string().min(2),
  bonusPoints: z.number().min(0).max(10)
});

export const templateSchemas = {
  STORY: storySchema,
  QUIZ: quizSchema,
  FLASHCARDS: flashcardsSchema,
  MINIGAME: miniGameSchema
};
