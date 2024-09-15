/*
  Warnings:

  - You are about to drop the column `group` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "group",
ADD COLUMN     "groups" TEXT[],
ALTER COLUMN "category" SET NOT NULL,
ALTER COLUMN "category" SET DATA TYPE TEXT;
