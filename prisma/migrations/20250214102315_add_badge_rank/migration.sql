/*
  Warnings:

  - Added the required column `rank` to the `Badge` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BadgeRank" AS ENUM ('BRONZE', 'SILVER', 'PLATINUM', 'DIAMOND');

-- AlterTable
ALTER TABLE "Badge" ADD COLUMN     "rank" "BadgeRank" NOT NULL;
