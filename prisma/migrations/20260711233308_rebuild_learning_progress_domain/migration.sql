/*
  Warnings:

  - You are about to drop the column `pointAwarded` on the `ChallengeAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `earnedPoints` on the `IslandProgress` table. All the data in the column will be lost.
  - You are about to drop the column `totalPossibleMandatoryPoints` on the `IslandProgress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StageProgress" ADD COLUMN "completedAt" DATETIME;
ALTER TABLE "StageProgress" ADD COLUMN "currentChallengeId" TEXT;
ALTER TABLE "StageProgress" ADD COLUMN "currentSceneId" TEXT;
ALTER TABLE "StageProgress" ADD COLUMN "startedAt" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChallengeAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "islandId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "gameId" TEXT,
    "challengeId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'UNSEEN',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "hasSubmittedGradedAttempt" BOOLEAN NOT NULL DEFAULT false,
    "firstAttemptCorrect" BOOLEAN,
    "earnedPoint" BOOLEAN NOT NULL DEFAULT false,
    "earnedPointAt" DATETIME,
    "skippedAt" DATETIME,
    "resolvedAt" DATETIME,
    "lastAnswerPayload" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChallengeAttempt_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChallengeAttempt" ("attemptCount", "challengeId", "createdAt", "firstAttemptCorrect", "id", "islandId", "profileId", "sceneId", "stageId", "state", "updatedAt") SELECT "attemptCount", "challengeId", "createdAt", "firstAttemptCorrect", "id", "islandId", "profileId", "sceneId", "stageId", "state", "updatedAt" FROM "ChallengeAttempt";
DROP TABLE "ChallengeAttempt";
ALTER TABLE "new_ChallengeAttempt" RENAME TO "ChallengeAttempt";
CREATE UNIQUE INDEX "ChallengeAttempt_profileId_islandId_challengeId_key" ON "ChallengeAttempt"("profileId", "islandId", "challengeId");
CREATE TABLE "new_IslandProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "islandId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "completedStageCount" INTEGER NOT NULL DEFAULT 0,
    "correctChallengeCount" INTEGER NOT NULL DEFAULT 0,
    "totalMandatoryChallenges" INTEGER NOT NULL DEFAULT 0,
    "finalScorePercent" REAL NOT NULL DEFAULT 0,
    "firstPassAccuracy" REAL NOT NULL DEFAULT 0,
    "pendingReviewCount" INTEGER NOT NULL DEFAULT 0,
    "gameCupCount" INTEGER NOT NULL DEFAULT 0,
    "starCount" INTEGER NOT NULL DEFAULT 0,
    "islandCupAwarded" BOOLEAN NOT NULL DEFAULT false,
    "islandCupAwardedAt" DATETIME,
    "lastResumeStageId" TEXT,
    "lastResumeSceneId" TEXT,
    "lastResumeChallengeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "IslandProgress_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_IslandProgress" ("createdAt", "id", "islandId", "profileId", "status", "updatedAt") SELECT "createdAt", "id", "islandId", "profileId", "status", "updatedAt" FROM "IslandProgress";
DROP TABLE "IslandProgress";
ALTER TABLE "new_IslandProgress" RENAME TO "IslandProgress";
CREATE UNIQUE INDEX "IslandProgress_profileId_islandId_key" ON "IslandProgress"("profileId", "islandId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
