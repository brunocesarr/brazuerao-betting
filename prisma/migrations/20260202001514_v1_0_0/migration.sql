-- CreateTable
CREATE TABLE "RoleGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RoleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestStatus" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "RequestStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT,
    "predictions" JSONB NOT NULL,
    "season" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringRule" (
    "id" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "ranges" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoringRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "challenge" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "allowPublicViewing" BOOLEAN NOT NULL DEFAULT false,
    "deadlineAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BetGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBetGroup" (
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestStatusId" TEXT NOT NULL,
    "roleGroupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ScoringRuleBetGroup" (
    "groupId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "RoleGroup_name_key" ON "RoleGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RequestStatus_status_key" ON "RequestStatus"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserBetGroup_groupId_userId_key" ON "UserBetGroup"("groupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoringRuleBetGroup_groupId_ruleId_key" ON "ScoringRuleBetGroup"("groupId", "ruleId");

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BetGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBetGroup" ADD CONSTRAINT "UserBetGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BetGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBetGroup" ADD CONSTRAINT "UserBetGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBetGroup" ADD CONSTRAINT "UserBetGroup_requestStatusId_fkey" FOREIGN KEY ("requestStatusId") REFERENCES "RequestStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBetGroup" ADD CONSTRAINT "UserBetGroup_roleGroupId_fkey" FOREIGN KEY ("roleGroupId") REFERENCES "RoleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoringRuleBetGroup" ADD CONSTRAINT "ScoringRuleBetGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BetGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoringRuleBetGroup" ADD CONSTRAINT "ScoringRuleBetGroup_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "ScoringRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
