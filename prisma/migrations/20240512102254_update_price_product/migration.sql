/*
  Warnings:

  - You are about to alter the column `finalPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `finalPrice` on the `Variant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `price` on the `Variant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "finalPrice" SET DEFAULT 0,
ALTER COLUMN "finalPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Variant" ALTER COLUMN "finalPrice" SET DEFAULT 0,
ALTER COLUMN "finalPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE INTEGER;
