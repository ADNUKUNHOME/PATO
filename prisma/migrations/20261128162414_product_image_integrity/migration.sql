-- Prevent duplicate product-level image registrations.
CREATE UNIQUE INDEX "product_images_product_storage_key_key"
ON "product_images" ("productId", "storageKey")
WHERE "variantId" IS NULL
AND "storageKey" IS NOT NULL;


-- Prevent duplicate variant-level image registrations.
CREATE UNIQUE INDEX "product_images_variant_storage_key_key"
ON "product_images" ("productId", "variantId", "storageKey")
WHERE "variantId" IS NOT NULL
AND "storageKey" IS NOT NULL;


-- Allow only one primary image per product-level scope.
CREATE UNIQUE INDEX "product_images_product_primary_key"
ON "product_images" ("productId")
WHERE "variantId" IS NULL
AND "isPrimary" = true;


-- Allow only one primary image per product variant.
CREATE UNIQUE INDEX "product_images_variant_primary_key"
ON "product_images" ("productId", "variantId")
WHERE "variantId" IS NOT NULL
AND "isPrimary" = true;