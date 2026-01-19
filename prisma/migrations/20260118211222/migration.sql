-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "photoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "predictions" JSONB NOT NULL,
    "season" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScoringRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "ranges" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BetGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RoleGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RequestStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserBetGroup" (
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleGroupId" TEXT NOT NULL,
    "requestStatusId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBetGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BetGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBetGroup_roleGroupId_fkey" FOREIGN KEY ("roleGroupId") REFERENCES "RoleGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBetGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBetGroup_requestStatusId_fkey" FOREIGN KEY ("requestStatusId") REFERENCES "RequestStatus" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bet_userId_season_key" ON "Bet"("userId", "season");

-- CreateIndex
CREATE UNIQUE INDEX "BetGroup_name_key" ON "BetGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RoleGroup_name_key" ON "RoleGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RequestStatus_status_key" ON "RequestStatus"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserBetGroup_groupId_userId_key" ON "UserBetGroup"("groupId", "userId");
