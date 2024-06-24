/*
  Warnings:

  - You are about to drop the `BrandSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BrandSettingsType" AS ENUM ('delivery', 'refund');

-- DropForeignKey
ALTER TABLE "BrandSettings" DROP CONSTRAINT "BrandSettings_brandId_fkey";

-- DropTable
DROP TABLE "BrandSettings";
