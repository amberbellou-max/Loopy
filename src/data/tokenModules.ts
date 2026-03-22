export interface TokenModule {
  id: number;
  title: string;
  definition: string;
  keyIdea: string;
  examples: string[];
  takeaway: string;
}

export const tokenModules: TokenModule[] = [
  {
    id: 1,
    title: "What is a Token?",
    definition: "A token is a small piece of text that AI reads.",
    keyIdea: "AI does not read full sentences at once. It reads piece by piece.",
    examples: [
      "\"Hello\" -> 1 token",
      "\"ChatGPT is cool\" -> around 4-6 tokens",
    ],
    takeaway: "Tokens are how AI understands language.",
  },
  {
    id: 2,
    title: "Tokens vs Words",
    definition: "Tokens are not the same as words.",
    keyIdea: "One word can be 1 token or multiple tokens.",
    examples: [
      "\"cat\" -> 1 token",
      "\"unbelievable\" -> un | believe | able",
    ],
    takeaway: "Tokens are based on learned patterns, not just spaces.",
  },
  {
    id: 3,
    title: "Tokens vs Characters",
    definition: "Tokens are not the same as letters either.",
    keyIdea: "Tokens sit between letters and words.",
    examples: [
      "\"a\" -> 1 token",
      "\"running\" -> run | ning",
    ],
    takeaway: "Tokens are learned chunks, not fixed sizes.",
  },
  {
    id: 4,
    title: "Why Tokens Exist",
    definition: "Tokens make language easier for AI to process.",
    keyIdea: "Smaller reusable pieces help models learn faster and generalize better.",
    examples: [
      "Instead of learning \"running\", \"runner\", and \"runs\" separately,",
      "AI can learn \"run\" plus endings.",
    ],
    takeaway: "Tokens help AI generalize language patterns.",
  },
  {
    id: 5,
    title: "Token Counting",
    definition: "Every input and output uses tokens.",
    keyIdea: "More text usually means more tokens, but shorter word count is not always cheaper.",
    examples: [
      "Rough rule in English: 1 token is about 3/4 of a word",
      "Short sentence -> low tokens, long sentence -> high tokens",
    ],
    takeaway: "Everything you send to AI has a token cost.",
  },
  {
    id: 6,
    title: "Token Limits (Context Window)",
    definition: "AI can only handle a limited number of tokens at once.",
    keyIdea: "There is a max memory size, and old tokens can drop off at the limit.",
    examples: [
      "If the limit is 100 tokens and you add more,",
      "earlier text may get removed from active context.",
    ],
    takeaway: "AI memory is limited by token window size.",
  },
  {
    id: 7,
    title: "Input vs Output Tokens",
    definition: "Input tokens are what you send. Output tokens are what AI returns.",
    keyIdea: "Total usage equals input plus output.",
    examples: [
      "You send 50 tokens",
      "AI replies with 100 tokens -> total 150",
    ],
    takeaway: "Both sides of the conversation consume tokens.",
  },
  {
    id: 8,
    title: "Why Tokens Matter",
    definition: "Tokens impact cost, speed, and context capacity.",
    keyIdea: "More tokens can increase cost, slow responses, and hit limits sooner.",
    examples: [
      "API billing is token-based",
      "Long exchanges can overflow context windows",
    ],
    takeaway: "Tokens affect performance, cost, and capability.",
  },
];

export const tokenAssumptionLedger: string[] = [
  "Beginner audience",
  "English language focus",
  "No prior AI knowledge",
];

export const tokenMissingInputs: string[] = [
  "Target age group",
  "Depth level (intro vs advanced)",
  "Whether quizzes/examples should be expanded",
];

export const tokenOneLever = "Repeat the anchor contrast: tokens != words != characters.";

export const tokenReversibleNextStep = "Ship Module 1 as one screen first, validate clarity, then add the rest.";

export const tokenSafeguard = "If a concept feels confusing, reduce to: AI reads text in small chunks called tokens.";

export const tokenPromptFlow: string[] = [
  "Aim: text chunks",
  "Instruct: read slow",
  "Gate: exhale, then reread",
  "Guard: choose clear over complex",
  "Verify: pre-check and post-check understanding",
];
