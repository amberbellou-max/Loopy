import Phaser from "phaser";

export type LearningTrack = "tokens" | "neural-nets";

export interface LevelLearningTopic {
  id: number;
  track: LearningTrack;
  title: string;
  coreIdea: string;
  whyItMatters: string;
  metaphor: string;
  objectiveLink: string;
  takeaway: string;
}

export const levelLearningTopics: LevelLearningTopic[] = [
  {
    id: 1,
    track: "tokens",
    title: "Tokens From Scratch",
    coreIdea: "AI reads text as small chunks called tokens, not full sentences all at once.",
    whyItMatters: "This explains model speed, limits, and API usage.",
    metaphor: "Sentences are packed into small labeled boxes on a conveyor belt.",
    objectiveLink: "Neural nets need chunked pieces they can convert into numbers.",
    takeaway: "Tokens are the first step from language to AI computation.",
  },
  {
    id: 2,
    track: "tokens",
    title: "Chunks, Not Words",
    coreIdea: "A token can be a full word, a subword piece, punctuation, or a spacing pattern.",
    whyItMatters: "Words and tokens are not the same, so prompt size can be misleading.",
    metaphor: "Some boxes hold full items, some hold only parts.",
    objectiveLink: "Chunking rules shape which language patterns the model can learn.",
    takeaway: "Tokenization follows efficiency patterns, not grammar rules.",
  },
  {
    id: 3,
    track: "tokens",
    title: "What Tokens Look Like",
    coreIdea: "\"cat\" might be one token while \"play\" + \"ing\" might be two.",
    whyItMatters: "Small punctuation or spacing edits can change usage and output behavior.",
    metaphor: "One toy can ship in one box, while another ships in two parts.",
    objectiveLink: "Models process an ordered stream of pieces, not dictionary words.",
    takeaway: "Tiny text changes can shift token counts.",
  },
  {
    id: 4,
    track: "tokens",
    title: "Why Models Use Tokens",
    coreIdea: "After splitting text, each token becomes an ID and the model predicts the next token.",
    whyItMatters: "This loop powers chatbots, autocomplete, and AI writing.",
    metaphor: "Each box gets a barcode before the system predicts the next box.",
    objectiveLink: "Token IDs bridge language into numeric neural-net inputs.",
    takeaway: "Token IDs plus next-token prediction are the core language loop.",
  },
  {
    id: 5,
    track: "tokens",
    title: "Worked Tokenization Example",
    coreIdea: "\"Transformers are simple.\" can split into ordered chunks like [Transform] [ers] [ are] [ simple] [.].",
    whyItMatters: "Seeing a real split makes debugging prompt behavior easier.",
    metaphor: "You can watch one sentence get boxed, labeled, and shipped in order.",
    objectiveLink: "Neural nets learn from both chunk content and chunk order.",
    takeaway: "Order matters as much as the chunks themselves.",
  },
  {
    id: 6,
    track: "tokens",
    title: "Why Not Only Words?",
    coreIdea: "Whole-word vocabularies are huge, and character-only vocabularies create long sequences.",
    whyItMatters: "Subword tokens handle slang, new names, and rare words efficiently.",
    metaphor: "Full-product boxes are too many; letter-only boxes are too slow.",
    objectiveLink: "Subwords keep neural-net sequences manageable while staying flexible.",
    takeaway: "Subword tokenization is the practical middle ground.",
  },
  {
    id: 7,
    track: "tokens",
    title: "Tokenizer Strategies",
    coreIdea: "BPE, WordPiece, and Unigram choose chunks using different merge or selection rules.",
    whyItMatters: "Different models can split the same sentence differently.",
    metaphor: "Different warehouses follow different packing policies.",
    objectiveLink: "Tokenizer choice changes the token IDs a neural net sees.",
    takeaway: "Token counts vary across models because tokenizer rules vary.",
  },
  {
    id: 8,
    track: "tokens",
    title: "Context Window Memory",
    coreIdea: "A context window is the total tokens a model can keep active at once.",
    whyItMatters: "Long notes or code can fill memory and push earlier details out.",
    metaphor: "A loading dock can hold only so many boxes before overflow.",
    objectiveLink: "Sequence limits shape what information the model can use.",
    takeaway: "Context windows are finite working memory.",
  },
  {
    id: 9,
    track: "tokens",
    title: "Tokens and Performance",
    coreIdea: "More tokens usually require more compute, time, and money.",
    whyItMatters: "Token budgeting keeps student tools fast and affordable.",
    metaphor: "More boxes mean more scanning and higher shipping cost.",
    objectiveLink: "Each extra token adds work for sequence processing.",
    takeaway: "Token count directly affects speed and cost.",
  },
  {
    id: 10,
    track: "tokens",
    title: "Formatting Changes Counts",
    coreIdea: "Capitalization, spacing, punctuation, and position can change tokenization.",
    whyItMatters: "Small formatting tweaks can quietly alter performance.",
    metaphor: "The same item can be packed differently with a different label.",
    objectiveLink: "Models react to exact input form, not meaning alone.",
    takeaway: "Exact text form influences token count and behavior.",
  },
  {
    id: 11,
    track: "tokens",
    title: "Token Rule Check",
    coreIdea: "Tokens are not always words, spaces can count, and both input and output consume tokens.",
    whyItMatters: "Mastering these rules gives students better prompt control.",
    metaphor: "This is a warehouse inspection: count boxes and track dock limits.",
    objectiveLink: "Clear token mental models unlock later concepts faster.",
    takeaway: "Input + output + window limits define token reality.",
  },
  {
    id: 12,
    track: "tokens",
    title: "Token Recap and Bridge",
    coreIdea: "Tokens turn language into ordered IDs that models can process mathematically.",
    whyItMatters: "This supports better prompts, limit handling, and project design.",
    metaphor: "Language enters as a sentence and exits as a sequence of barcoded boxes.",
    objectiveLink: "Next step: IDs become embeddings and feed attention patterns.",
    takeaway: "Tokens are the front door to modern language models.",
  },
  {
    id: 13,
    track: "neural-nets",
    title: "Neural Nets From Scratch",
    coreIdea: "Neural nets learn patterns from examples and map inputs to predictions.",
    whyItMatters: "This is the engine behind many modern AI features.",
    metaphor: "Many simple judges each score one part of a performance.",
    objectiveLink: "A network is many simple scoring units working together.",
    takeaway: "Neural nets are trainable pattern-finding systems.",
  },
  {
    id: 14,
    track: "neural-nets",
    title: "Input to Output Mapping",
    coreIdea: "The model's job is to turn messy input data into a useful output label or value.",
    whyItMatters: "This is why neural nets are practical in vision, search, and recommendations.",
    metaphor: "Performance details go in, a final talent category comes out.",
    objectiveLink: "Neural nets solve mapping problems: features in, prediction out.",
    takeaway: "A neural net is a learned input-output function.",
  },
  {
    id: 15,
    track: "neural-nets",
    title: "One Artificial Neuron",
    coreIdea: "A neuron multiplies inputs by weights, adds them, and outputs a score.",
    whyItMatters: "Understanding one neuron makes whole networks less intimidating.",
    metaphor: "One judge combines rhythm, pitch, and confidence into one score.",
    objectiveLink: "Large networks are stacks of small mathematical units.",
    takeaway: "Complex AI emerges from many simple neuron calculations.",
  },
  {
    id: 16,
    track: "neural-nets",
    title: "Weights and Bias",
    coreIdea: "Weights set feature importance and bias shifts when a neuron activates.",
    whyItMatters: "These parameters strongly affect accuracy and behavior.",
    metaphor: "A judge might care a lot about pitch and only a little about costume.",
    objectiveLink: "Learning means adjusting weights and bias to reduce error.",
    takeaway: "Weights and bias determine what the model pays attention to.",
  },
  {
    id: 17,
    track: "neural-nets",
    title: "Activation Functions",
    coreIdea: "Activation functions decide which neuron signals move forward.",
    whyItMatters: "Without nonlinearity, models miss rich real-world patterns.",
    metaphor: "Only strong performances hit the next-round buzzer.",
    objectiveLink: "Activation adds the expressive power neural nets need.",
    takeaway: "Activation turns raw scores into useful signal flow.",
  },
  {
    id: 18,
    track: "neural-nets",
    title: "Layers Build Meaning",
    coreIdea: "Input layers read raw features, hidden layers combine clues, and output layers decide.",
    whyItMatters: "Layered structure enables advanced AI behavior.",
    metaphor: "Early judges notice details, later judges combine them into final decisions.",
    objectiveLink: "Deeper layers compose simple clues into higher-level patterns.",
    takeaway: "Stacked layers transform details into meaning.",
  },
  {
    id: 19,
    track: "neural-nets",
    title: "Training Loop Basics",
    coreIdea: "Forward pass makes a guess, loss measures error, and backprop updates weights.",
    whyItMatters: "This is how model quality improves over time.",
    metaphor: "After each show, judges review mistakes and adjust scoring rules.",
    objectiveLink: "Backpropagation plus gradient descent is the core learning engine.",
    takeaway: "Neural nets improve through repeated error correction.",
  },
];

export function getLearningTopicForLevel(levelId: number): LevelLearningTopic {
  const index = Phaser.Math.Wrap(levelId - 1, 0, levelLearningTopics.length);
  return levelLearningTopics[index];
}

const inGameExamplesByTopicId: Record<number, string> = {
  1: "When you eat food, Token Lab 'in' increases. You are feeding the model context.",
  2: "A short-looking action can still move token counts a lot. Watch the HUD numbers, not just text length.",
  3: "As you fire glitter bursts, 'out' rises in chunks. Output is tokenized piece by piece.",
  4: "Each action updates the next state step-by-step, like next-token prediction updates sequence state.",
  5: "Track order matters: if you spam shots early, your output budget changes before checkpoint decisions.",
  6: "Near the end of a run, low 'Window left' shows context pressure. You must prioritize what to keep.",
  7: "Different response styles (Efficient/Balanced/Verbose) mimic different tokenization/output behaviors.",
  8: "If total usage approaches the cap, your available context shrinks just like model working memory.",
  9: "Long fights and extra shots raise token cost. Cleaner play keeps budget and speed healthier.",
  10: "Small behavior changes, like burst timing, can shift token totals even if the level goal is the same.",
  11: "Input and output both count in your run. You can overflow from either side if you ignore both.",
  12: "Your full run history becomes a numbered budget story: in + out + remaining context.",
  13: "Enemies expose patterns; you learn and react. That mirrors pattern recognition in neural nets.",
  14: "Level state goes in (position, enemies, hazards) and your control choice outputs the next result.",
  15: "Each tiny decision (move, shoot, dash) is like a small neuron vote inside a bigger strategy.",
  16: "If you overvalue one signal (only shooting), performance drops. Good weighting improves outcomes.",
  17: "Activation is like commitment: only strong opportunities should trigger high-cost actions.",
  18: "Early play reads simple cues; later play combines cues into higher-level plans.",
  19: "Each death/adjustment loop is training: observe error, adjust, then perform better next attempt.",
};

const tryItPromptsByTopicId: Record<number, string> = {
  1: "Eat 3 foods without firing and watch only the input counter rise.",
  2: "Compare one run with short bursts vs long bursts and note token differences.",
  3: "Fire single shots, then hold fire, and compare output growth speed.",
  4: "Pause after each action and predict which HUD token value will change next.",
  5: "Run the same route twice with different action order and compare totals.",
  6: "When window gets low, stop unnecessary shots and preserve context room.",
  7: "Aim for Efficient style once, then intentionally reach Verbose and compare.",
  8: "Before checkpoint, check Window left and decide if you can afford extra output.",
  9: "Try a low-shot run and see how total token usage and flow improve.",
  10: "Make one small timing change and observe how token totals shift.",
  11: "Keep both input and output visible and call out which side is dominating.",
  12: "Finish with at least 20% window remaining.",
  13: "Identify one repeated enemy pattern and counter it consistently.",
  14: "Call out one input signal, one action, and one outcome during play.",
  15: "Use one action only when two cues align (position + threat).",
  16: "Rebalance: if one tactic fails, intentionally shift to a different one.",
  17: "Only trigger specials when reward is high; avoid low-value activations.",
  18: "Name simple cues first, then combine them into one plan.",
  19: "After a mistake, state one adjustment and apply it immediately.",
};

export function getLearningInGameExample(levelId: number): string {
  const topic = getLearningTopicForLevel(levelId);
  return inGameExamplesByTopicId[topic.id] ?? "Watch Token Lab HUD and connect each action to token changes.";
}

export function getLearningTryItPrompt(levelId: number): string {
  const topic = getLearningTopicForLevel(levelId);
  return tryItPromptsByTopicId[topic.id] ?? "Use HUD token metrics to guide your next decision.";
}
