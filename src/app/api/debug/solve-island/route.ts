import { NextResponse } from 'next/server';
import { submitChallengeAttempt, evaluateIslandCompletionAndUnlockNextIslandAction } from '@/features/learning-core/actions';
import { getLessonData } from '@/features/learning-core/data/adapter';

export async function POST(req: Request) {
  const { islandId } = await req.json();
  const lessonData = getLessonData(islandId);
  if (!lessonData) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let completed = 0;
  for (const game of (lessonData.games || [])) {
    for (const challenge of (game.challenges || [])) {
      await submitChallengeAttempt({
        islandId,
        stageId: game.gameId,
        gameId: game.gameId,
        challengeId: challenge.challengeId,
        sceneId: 'test',
        isCorrect: true
      });
      completed++;
    }
  }

  const evalResult = await evaluateIslandCompletionAndUnlockNextIslandAction(islandId);

  return NextResponse.json({ success: true, completed, evalResult });
}
