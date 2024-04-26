/*
  Warnings:

  - A unique constraint covering the columns `[variantId,optionId]` on the table `VariantValue` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[variantId,optionId,optionValueId]` on the table `VariantValue` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Settings" ALTER COLUMN "data" SET DEFAULT '[]';

-- CreateIndex
CREATE UNIQUE INDEX "VariantValue_variantId_optionId_key" ON "VariantValue"("variantId", "optionId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantValue_variantId_optionId_optionValueId_key" ON "VariantValue"("variantId", "optionId", "optionValueId");
