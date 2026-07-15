-- CreateTable
CREATE TABLE "PlayerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "avatarId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlayerSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    CONSTRAINT "PlayerSession_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "IslandProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "islandId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "earnedPoints" INTEGER NOT NULL DEFAULT 0,
    "totalPossibleMandatoryPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IslandProgress_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StageProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "islandProgressId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StageProgress_islandProgressId_fkey" FOREIGN KEY ("islandProgressId") REFERENCES "IslandProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SceneProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stageProgressId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SceneProgress_stageProgressId_fkey" FOREIGN KEY ("stageProgressId") REFERENCES "StageProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChallengeAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "islandId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'UNSEEN',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "firstAttemptCorrect" BOOLEAN NOT NULL DEFAULT false,
    "pointAwarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChallengeAttempt_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PendingItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PendingItem_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResumeLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "islandId" TEXT,
    "stageId" TEXT,
    "sceneId" TEXT,
    "urlPath" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ResumeLocation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RewardLedger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RewardLedger_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IdempotencyRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "actionKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IdempotencyRecord_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentVersion_version_key" ON "ContentVersion"("version");

-- CreateIndex
CREATE UNIQUE INDEX "IslandProgress_profileId_islandId_key" ON "IslandProgress"("profileId", "islandId");

-- CreateIndex
CREATE UNIQUE INDEX "StageProgress_islandProgressId_stageId_key" ON "StageProgress"("islandProgressId", "stageId");

-- CreateIndex
CREATE UNIQUE INDEX "SceneProgress_stageProgressId_sceneId_key" ON "SceneProgress"("stageProgressId", "sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeAttempt_profileId_challengeId_key" ON "ChallengeAttempt"("profileId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeLocation_profileId_key" ON "ResumeLocation"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardLedger_profileId_rewardType_referenceId_key" ON "RewardLedger"("profileId", "rewardType", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyRecord_profileId_actionKey_key" ON "IdempotencyRecord"("profileId", "actionKey");
