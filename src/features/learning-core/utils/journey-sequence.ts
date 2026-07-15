import { LessonData } from "../data/schema";

export function getJourneySequence(lessonData: LessonData): string[] {
  const sequence: string[] = [
    'objectives',
    'warmup',
    'story',
    'charactersAndWords',
  ];

  if (lessonData.explanationScenes) {
    sequence.push(...lessonData.explanationScenes.map(s => s.sceneId));
  }

  if (lessonData.games) {
    sequence.push(...lessonData.games.map(g => g.gameId));
  }

  sequence.push('review');
  sequence.push('conclusion');

  return sequence;
}

export function getNextStageId(lessonData: LessonData, currentStageId: string): string | null {
  const sequence = getJourneySequence(lessonData);
  const currentIndex = sequence.indexOf(currentStageId);
  
  if (currentIndex === -1 || currentIndex === sequence.length - 1) {
    return null; // Go back to island map if we don't know where we are or at the end
  }
  
  return sequence[currentIndex + 1];
}
