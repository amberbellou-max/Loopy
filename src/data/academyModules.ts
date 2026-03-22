import { levelLearningTopics, type LearningTrack } from "./levelLearningTopics";

export interface AcademyModule {
  id: number;
  track: LearningTrack;
  title: string;
  definition: string;
  keyIdea: string;
  examples: string[];
  takeaway: string;
  taughtInLevel?: number;
}

const levelMappedModules: AcademyModule[] = levelLearningTopics.map((topic) => ({
  id: topic.id,
  track: topic.track,
  title: topic.title,
  definition: topic.coreIdea,
  keyIdea: topic.whyItMatters,
  examples: [
    `Metaphor: ${topic.metaphor}`,
    `How this helps: ${topic.objectiveLink}`,
  ],
  takeaway: topic.takeaway,
  taughtInLevel: topic.id,
}));

const neuralNetExtensionModules: AcademyModule[] = [
  {
    id: 20,
    track: "neural-nets",
    title: "Forward Pass",
    definition: "During a forward pass, data moves layer by layer until the model outputs a prediction.",
    keyIdea: "This is what happens each time an AI system makes a live guess.",
    examples: [
      "Talent-show metaphor: a performer moves from auditions to finals, with each round adding a score.",
      "Use case: image in -> label out, voice in -> transcript out, prompt in -> response out.",
    ],
    takeaway: "The forward pass is the input-to-output path of inference.",
  },
  {
    id: 21,
    track: "neural-nets",
    title: "How Training Starts",
    definition: "Training begins with mostly random weights, so early model guesses are often poor.",
    keyIdea: "The model measures how wrong it is with a loss score.",
    examples: [
      "Talent-show metaphor: judges start with messy scoring rules, then review how wrong they were.",
      "Learning loop: guess -> compare with truth -> compute error.",
    ],
    takeaway: "Neural nets learn by measuring and reducing error over many examples.",
  },
  {
    id: 22,
    track: "neural-nets",
    title: "How Learning Happens",
    definition: "Backpropagation sends error backward and gradient descent applies small parameter updates.",
    keyIdea: "Tiny repeated updates improve the next prediction over time.",
    examples: [
      "Talent-show metaphor: judges adjust what they value after bad outcomes.",
      "Math loop: gradients indicate direction, step size controls how far to move.",
    ],
    takeaway: "Backprop + gradient descent is the core optimization engine.",
  },
  {
    id: 23,
    track: "neural-nets",
    title: "Different Neural Nets for Different Jobs",
    definition: "Model architectures are specialized by data type and task.",
    keyIdea: "CNNs excel on images, while Transformers handle language and long-range dependencies.",
    examples: [
      "Talent-show metaphor: different judging panels for dance, art, and debate.",
      "Design rule: match architecture to the structure of your data.",
    ],
    takeaway: "Choosing the right architecture is part of solving the problem well.",
  },
  {
    id: 24,
    track: "neural-nets",
    title: "Limits, Myths, and Big Picture",
    definition: "A neural net is not a human brain; it is a trainable pattern system with limits.",
    keyIdea: "Models can overfit, absorb bias, and sound confident while being wrong.",
    examples: [
      "Talent-show metaphor: judges can be biased by flashy acts and still make wrong picks.",
      "Reality check: good outputs do not guarantee true understanding or fairness.",
    ],
    takeaway: "Use AI critically: verify outputs, check bias, and design responsibly.",
  },
];

export const academyModules: AcademyModule[] = [
  ...levelMappedModules,
  ...neuralNetExtensionModules,
];
