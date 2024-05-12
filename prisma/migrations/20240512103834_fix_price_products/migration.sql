/*
  Warnings:

  - You are about to alter the column `finalPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `finalPrice` on the `Variant` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `price` on the `Variant` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "finalPrice" SET DEFAULT 0,
ALTER COLUMN "finalPrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Variant" ALTER COLUMN "finalPrice" SET DEFAULT 0,
ALTER COLUMN "finalPrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);
