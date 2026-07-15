import { z } from "zod";

export const ChoiceSchema = z.object({
  choiceId: z.string(),
  text: z.string().optional(),
  imageUrl: z.string().optional()
});

export const ChallengeSchema = z.object({
  challengeId: z.string(),
  instruction: z.string(),
  stimulus: z.string().optional(),
  choices: z.array(ChoiceSchema).optional(),
  correctChoiceTexts: z.array(z.string()).optional(),
  correctChoiceIds: z.array(z.string()).optional(),
  correctFeedback: z.string(),
  retryFeedback: z.string(),
  basePoints: z.number().default(1),
  maxGuidedRetries: z.number().default(2),
  skipPolicy: z.enum(["TEMPORARY_SKIP_TO_SKIPPED_PENDING", "NO_SKIP"]).default("TEMPORARY_SKIP_TO_SKIPPED_PENDING"),
  replayPolicy: z.enum(["REPLAY_ALLOWED_NO_ADDITIONAL_POINTS", "NO_REPLAY"]).default("REPLAY_ALLOWED_NO_ADDITIONAL_POINTS"),
  requiredAudioCueKinds: z.array(z.string()).optional()
});

export const GameSchema = z.object({
  gameId: z.string(),
  title: z.string(),
  mechanic: z.string(),
  adventureTreatment: z.string().optional(),
  challenges: z.array(ChallengeSchema)
});

export const ExplanationSceneSchema = z.object({
  sceneId: z.string(),
  title: z.string(),
  content: z.string()
});

export const LessonDataSchema = z.object({
  lessonId: z.string(),
  islandId: z.string(),
  title: z.string(),
  activeLevels: z.number(),
  world: z.string(),
  objectives: z.array(z.string()),
  warmup: z.object({
    title: z.string(),
    description: z.string(),
    script: z.string()
  }),
  story: z.object({
    title: z.string(),
    narration: z.string(),
    presentation: z.string()
  }),
  charactersAndWords: z.array(z.string()),
  explanationScenes: z.array(ExplanationSceneSchema).optional(),
  games: z.array(GameSchema),
  review: z.string().optional(),
  conclusion: z.string().optional()
});

export type LessonData = z.infer<typeof LessonDataSchema>;

export const SourceReferenceSchema = z.object({
  file: z.string(),
  pageOrSection: z.string(),
  note: z.string().optional()
});

export const VisualAssetReferenceSchema = z.object({
  assetId: z.string(),
  imageUrl: z.string(),
  altText: z.string(),
  visualRole: z.enum([
    "STORY_SCENE",
    "CHALLENGE_STIMULUS",
    "CHARACTER",
    "OBJECT",
    "PLACE",
    "EXPLANATION",
    "WARMUP",
    "CONCLUSION"
  ]),
  requiredSubject: z.string().optional(),
  aspectRatio: z.string(),
  objectFit: z.enum(["cover", "contain"]),
  focalPoint: z.object({
    x: z.number(),
    y: z.number()
  }).optional(),
  desktopPosition: z.string().optional(),
  mobilePosition: z.string().optional(),
  sourceStatus: z.enum([
    "EXISTING_APPROVED",
    "GENERATED_SELECTED",
    "MISSING"
  ]),
  sourceReference: z.string().optional()
});

export const StorySceneSchema = z.object({
  sceneId: z.string(),
  lessonId: z.string(),
  order: z.number(),
  title: z.string(),
  narration: z.string(),
  shortNarration: z.string().optional(),
  characters: z.array(z.string()),
  location: z.string(),
  action: z.string(),
  emotionalTone: z.string(),
  emphasizedWords: z.array(z.string()).optional(),
  cueIds: z.array(z.string()),
  imageAssetId: z.string(),
  visual: VisualAssetReferenceSchema,
  previousSceneId: z.string().optional(),
  nextSceneId: z.string().optional(),
  sourceReferences: z.array(SourceReferenceSchema)
});

export const ChallengePresentationSchema = z.object({
  challengeId: z.string(),
  visual: VisualAssetReferenceSchema.optional()
});

export const GamePresentationSchema = z.object({
  gameId: z.string(),
  challenges: z.array(ChallengePresentationSchema)
});

export const LessonPresentationSchema = z.object({
  version: z.string(),
  lessonId: z.string(),
  islandId: z.string(),
  storyScenes: z.array(StorySceneSchema),
  games: z.array(GamePresentationSchema)
});

export type SourceReference = z.infer<typeof SourceReferenceSchema>;
export type VisualAssetReference = z.infer<typeof VisualAssetReferenceSchema>;
export type StoryScene = z.infer<typeof StorySceneSchema>;
export type ChallengePresentation = z.infer<typeof ChallengePresentationSchema>;
export type GamePresentation = z.infer<typeof GamePresentationSchema>;
export type LessonPresentation = z.infer<typeof LessonPresentationSchema>;
