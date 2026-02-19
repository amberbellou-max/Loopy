export type TokenLessonReason = "death" | "chapter";

export interface TokenLesson {
  id: string;
  title: string;
  body: string;
  example?: string;
  tags?: TokenLessonReason[];
}

export const tokenLessons: TokenLesson[] = [
  {
    id: "token-basics",
    title: "Tokens Are Chunks",
    body: "AI reads text in chunks called tokens, not full words.",
    example: "Example: 'fantastic' may split into multiple tokens.",
  },
  {
    id: "token-size-rule",
    title: "Rule of Thumb",
    body: "Roughly, 1 token is about 4 English characters. It varies by text.",
    example: "Example: 100 tokens is often around 70–80 words.",
  },
  {
    id: "prompt-cost",
    title: "Prompts Cost Tokens",
    body: "Longer prompts use more input tokens, which can raise cost.",
    tags: ["death"],
    example: "Trim repeated instructions to save tokens.",
  },
  {
    id: "response-cost",
    title: "Replies Use Tokens Too",
    body: "Model outputs also consume tokens, so answer length matters.",
    tags: ["chapter"],
    example: "Asking for a short answer lowers output tokens.",
  },
  {
    id: "context-window",
    title: "Context Is a Budget",
    body: "Each model has a context window measured in tokens.",
    example: "Old + new messages must fit in the window.",
  },
  {
    id: "history-overflow",
    title: "Old Chat Can Drop Off",
    body: "If context gets too long, earlier details may be truncated.",
    tags: ["chapter"],
    example: "Summaries help preserve key facts.",
  },
  {
    id: "formatting-impact",
    title: "Format Changes Count",
    body: "Extra punctuation, code blocks, and JSON all add tokens.",
    example: "Compact formats can be cheaper than verbose prose.",
  },
  {
    id: "language-variance",
    title: "Language Varies",
    body: "Token density differs by language and symbol usage.",
    example: "Emoji and mixed scripts can tokenize differently.",
  },
  {
    id: "compress-instructions",
    title: "Compress Repetition",
    body: "Repeat key rules once, then reference them instead of restating.",
    tags: ["death"],
    example: "A short checklist beats repeated paragraphs.",
  },
  {
    id: "batch-requests",
    title: "Batch Small Tasks",
    body: "Combining related asks can reduce overhead token usage.",
    tags: ["chapter"],
    example: "Ask for plan + patch + tests in one request.",
  },
  {
    id: "estimate-before-send",
    title: "Estimate First",
    body: "Estimate token size before sending huge docs or logs.",
    example: "Summarize logs first, then send key lines.",
  },
  {
    id: "cost-limit-mindset",
    title: "Think Budget + Quality",
    body: "Best prompts balance clarity, brevity, and required detail.",
    tags: ["death", "chapter"],
    example: "Be specific, but avoid filler text.",
  },
];
