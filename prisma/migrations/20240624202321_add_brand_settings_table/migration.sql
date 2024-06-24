-- CreateTable
CREATE TABLE "BrandSettings" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '[]',
    "brandId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandSettings_id_key" ON "BrandSettings"("id");

-- AddForeignKey
ALTER TABLE "BrandSettings" ADD CONSTRAINT "BrandSettings_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
