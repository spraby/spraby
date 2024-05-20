-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_imageId_fkey";

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "ProductImage"("id") ON DELETE SET NULL ON UPDATE SET NULL;
