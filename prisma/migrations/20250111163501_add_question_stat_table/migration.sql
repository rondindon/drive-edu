/*
  Warnings:

  - You are about to drop the `WrongAnswer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WrongAnswer" DROP CONSTRAINT "WrongAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "WrongAnswer" DROP CONSTRAINT "WrongAnswer_userId_fkey";

-- DropTable
DROP TABLE "WrongAnswer";

-- CreateTable
CREATE TABLE "QuestionStat" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionStat_userId_questionId_key" ON "QuestionStat"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "QuestionStat" ADD CONSTRAINT "QuestionStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionStat" ADD CONSTRAINT "QuestionStat_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
