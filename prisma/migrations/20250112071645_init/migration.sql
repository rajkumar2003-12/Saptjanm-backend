/*
  Warnings:

  - You are about to drop the column `age` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `employedIn` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `familyStatus` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `familyType` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "age",
DROP COLUMN "employedIn",
DROP COLUMN "familyStatus",
DROP COLUMN "familyType";
