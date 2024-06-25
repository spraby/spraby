-- CreateEnum
CREATE TYPE "BrandSettingsType" AS ENUM ('delivery', 'refund');

-- CreateTable
CREATE TABLE "BrandSettings" (
    "id" TEXT NOT NULL,
    "type" "BrandSettingsType" NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "brandId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandSettings_type_brandId_key" ON "BrandSettings"("type", "brandId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandSettings_id_type_brandId_key" ON "BrandSettings"("id", "type", "brandId");

-- AddForeignKey
ALTER TABLE "BrandSettings" ADD CONSTRAINT "BrandSettings_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
