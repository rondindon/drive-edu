/*
  Warnings:

  - A unique constraint covering the columns `[userId,questionId]` on the table `WrongAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WrongAnswer_userId_questionId_key" ON "WrongAnswer"("userId", "questionId");
