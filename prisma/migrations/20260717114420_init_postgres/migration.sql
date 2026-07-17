-- CreateTable
CREATE TABLE "PlayerProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerSession" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),

    CONSTRAINT "PlayerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IslandProgress" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "islandId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "completedStageCount" INTEGER NOT NULL DEFAULT 0,
    "correctChallengeCount" INTEGER NOT NULL DEFAULT 0,
    "totalMandatoryChallenges" INTEGER NOT NULL DEFAULT 0,
    "finalScorePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "firstPassAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingReviewCount" INTEGER NOT NULL DEFAULT 0,
    "gameCupCount" INTEGER NOT NULL DEFAULT 0,
    "starCount" INTEGER NOT NULL DEFAULT 0,
    "islandCupAwarded" BOOLEAN NOT NULL DEFAULT false,
    "islandCupAwardedAt" TIMESTAMP(3),
    "lastResumeStageId" TEXT,
    "lastResumeSceneId" TEXT,
    "lastResumeChallengeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "IslandProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageProgress" (
    "id" TEXT NOT NULL,
    "islandProgressId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "currentSceneId" TEXT,
    "currentChallengeId" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SceneProgress" (
    "id" TEXT NOT NULL,
    "stageProgressId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SceneProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeAttempt" (
    "id" TEXT NOT NULL,
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
    "earnedPointAt" TIMESTAMP(3),
    "skippedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "lastAnswerPayload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingItem" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeLocation" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "islandId" TEXT,
    "stageId" TEXT,
    "sceneId" TEXT,
    "urlPath" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardLedger" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyRecord" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "actionKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "ChallengeAttempt_profileId_islandId_challengeId_key" ON "ChallengeAttempt"("profileId", "islandId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeLocation_profileId_key" ON "ResumeLocation"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardLedger_profileId_rewardType_referenceId_key" ON "RewardLedger"("profileId", "rewardType", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyRecord_profileId_actionKey_key" ON "IdempotencyRecord"("profileId", "actionKey");

-- AddForeignKey
ALTER TABLE "PlayerSession" ADD CONSTRAINT "PlayerSession_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IslandProgress" ADD CONSTRAINT "IslandProgress_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageProgress" ADD CONSTRAINT "StageProgress_islandProgressId_fkey" FOREIGN KEY ("islandProgressId") REFERENCES "IslandProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneProgress" ADD CONSTRAINT "SceneProgress_stageProgressId_fkey" FOREIGN KEY ("stageProgressId") REFERENCES "StageProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAttempt" ADD CONSTRAINT "ChallengeAttempt_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingItem" ADD CONSTRAINT "PendingItem_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeLocation" ADD CONSTRAINT "ResumeLocation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardLedger" ADD CONSTRAINT "RewardLedger_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdempotencyRecord" ADD CONSTRAINT "IdempotencyRecord_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
