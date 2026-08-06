-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'QUALIFIED', 'NOT_READY', 'CONTACTED', 'CONVERTED');

-- CreateTable
CREATE TABLE "mentor_leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lifeEvent" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "availability" TEXT NOT NULL DEFAULT '',
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "qualificationNotes" TEXT NOT NULL DEFAULT '',
    "convertedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lifeEvent" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mentor_leads_email_key" ON "mentor_leads"("email");

-- CreateIndex
CREATE UNIQUE INDEX "mentor_leads_convertedUserId_key" ON "mentor_leads"("convertedUserId");

-- CreateIndex
CREATE INDEX "mentor_leads_status_score_idx" ON "mentor_leads"("status", "score");

-- CreateIndex
CREATE INDEX "mentor_leads_lifeEvent_idx" ON "mentor_leads"("lifeEvent");

-- CreateIndex
CREATE UNIQUE INDEX "mentees_email_key" ON "mentees"("email");

-- CreateIndex
CREATE INDEX "mentees_lifeEvent_idx" ON "mentees"("lifeEvent");

-- AddForeignKey
ALTER TABLE "mentor_leads" ADD CONSTRAINT "mentor_leads_convertedUserId_fkey" FOREIGN KEY ("convertedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
