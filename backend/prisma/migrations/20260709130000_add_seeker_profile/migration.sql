-- CreateTable
CREATE TABLE "SeekerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tags" TEXT[],
    "goals" TEXT[],
    "preferences" TEXT[],
    "urgency" TEXT,
    "emotionalState" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeekerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeekerProfile_userId_key" ON "SeekerProfile"("userId");

-- AddForeignKey
ALTER TABLE "SeekerProfile" ADD CONSTRAINT "SeekerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
