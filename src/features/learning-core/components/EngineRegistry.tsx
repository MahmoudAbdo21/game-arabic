import React from "react";
import { ChallengeSchema } from "../data/schema";
import { z } from "zod";
import { ChoiceEngine } from "./engines/ChoiceEngine";
import { ClassificationEngine } from "./engines/ClassificationEngine";
import { OrderingEngine } from "./engines/OrderingEngine";

type Challenge = z.infer<typeof ChallengeSchema>;

interface EngineRegistryProps {
  islandId: string;
  gameId: string;
  mechanicId: string;
  challenge: Challenge;
  onComplete: (result: { passed: boolean }) => void;
}

export function EngineRegistry({ islandId, gameId, mechanicId, challenge, onComplete }: EngineRegistryProps) {
  const isClassification = mechanicId.includes("CLASSIFY");
  const isOrdering = mechanicId.includes("ORDER");

  if (isClassification) {
    return (
      <ClassificationEngine 
        islandId={islandId}
        gameId={gameId}
        challenge={challenge} 
        onComplete={onComplete}
      />
    );
  }

  if (isOrdering) {
    return (
      <OrderingEngine 
        islandId={islandId}
        gameId={gameId}
        challenge={challenge} 
        onComplete={onComplete}
      />
    );
  }

  return (
    <ChoiceEngine 
      islandId={islandId}
      gameId={gameId}
      challenge={challenge} 
      onComplete={onComplete}
    />
  );
}
