export type TemplateType = "STORY" | "QUIZ" | "FLASHCARDS" | "MINIGAME";

export type Category = "math" | "reading" | "science" | "Bible" | "geography";

export interface SafetyResult {
  cleanedText: string;
  flags: string[];
}
