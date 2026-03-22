import { tokenModules } from "./tokenModules";

export type TokenLessonReason = "death" | "chapter";

export interface TokenLesson {
  id: string;
  title: string;
  body: string;
  example?: string;
  tags?: TokenLessonReason[];
}

const deathFocusedModules = new Set<number>([2, 5, 6, 7]);

export const tokenLessons: TokenLesson[] = tokenModules.map((module) => ({
  id: `module-${module.id}`,
  title: `Module ${module.id}: ${module.title}`,
  body: `${module.definition} ${module.keyIdea}`,
  example: `${module.examples[0]} | Takeaway: ${module.takeaway}`,
  tags: deathFocusedModules.has(module.id) ? ["death"] : ["chapter"],
}));
