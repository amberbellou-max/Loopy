import {
  getLearningInGameExample,
  getLearningTryItPrompt,
  levelLearningTopics,
  type LearningTrack,
} from "./levelLearningTopics";

export interface AcademyModule {
  id: number;
  track: LearningTrack;
  title: string;
  definition: string;
  keyIdea: string;
  inGameExample: string;
  tryIt: string;
  takeaway: string;
  taughtInLevel?: number;
}

const levelMappedModules: AcademyModule[] = levelLearningTopics.map((topic) => ({
  id: topic.id,
  track: topic.track,
  title: topic.title,
  definition: topic.coreIdea,
  keyIdea: topic.whyItMatters,
  inGameExample: getLearningInGameExample(topic.id),
  tryIt: getLearningTryItPrompt(topic.id),
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
    inGameExample: "Your run updates every frame: world state in, next player/world state out.",
    tryIt: "Pause mentally each second and identify one input state and one resulting output action.",
    takeaway: "The forward pass is the input-to-output path of inference.",
  },
  {
    id: 21,
    track: "neural-nets",
    title: "How Training Starts",
    definition: "Training begins with mostly random weights, so early model guesses are often poor.",
    keyIdea: "The model measures how wrong it is with a loss score.",
    inGameExample: "Your first attempt on a hard level is usually rough until feedback reveals mistakes.",
    tryIt: "After one failed attempt, list one specific error signal before retrying.",
    takeaway: "Neural nets learn by measuring and reducing error over many examples.",
  },
  {
    id: 22,
    track: "neural-nets",
    title: "How Learning Happens",
    definition: "Backpropagation sends error backward and gradient descent applies small parameter updates.",
    keyIdea: "Tiny repeated updates improve the next prediction over time.",
    inGameExample: "Small play adjustments (timing, spacing, pathing) compound into much better outcomes.",
    tryIt: "Change just one behavior for a full run and compare your result.",
    takeaway: "Backprop + gradient descent is the core optimization engine.",
  },
  {
    id: 23,
    track: "neural-nets",
    title: "Different Neural Nets for Different Jobs",
    definition: "Model architectures are specialized by data type and task.",
    keyIdea: "CNNs excel on images, while Transformers handle language and long-range dependencies.",
    inGameExample: "Different abilities fit different threats; one tool does not solve every situation.",
    tryIt: "Choose one section to clear mostly with movement, then another with burst control.",
    takeaway: "Choosing the right architecture is part of solving the problem well.",
  },
  {
    id: 24,
    track: "neural-nets",
    title: "Limits, Myths, and Big Picture",
    definition: "A neural net is not a human brain; it is a trainable pattern system with limits.",
    keyIdea: "Models can overfit, absorb bias, and sound confident while being wrong.",
    inGameExample: "A flashy strategy can fail in different biome conditions; robust play needs validation.",
    tryIt: "Test one strategy across two levels and note where it breaks.",
    takeaway: "Use AI critically: verify outputs, check bias, and design responsibly.",
  },
];

export const academyModules: AcademyModule[] = [
  ...levelMappedModules,
  ...neuralNetExtensionModules,
];
