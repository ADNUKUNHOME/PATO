
import { z } from "zod";

const productVariantSchema = z
    .object({
        sku: z
            .string()
            .trim()
            .min(1, "SKU is required.")
            .max(100, "SKU must not exceed 100 characters.")
            .transform((value) => value.toUpperCase()),

        sizeId: z.string().trim().min(1, "Size is required."),

        colorId: z.string().trim().min(1, "Color is required."),

        price: z
            .number()
            .finite()
            .positive("Price must be greater than zero.")
            .multipleOf(0.01, "Price can have at most two decimal places."),

        compareAtPrice: z
            .number()
            .finite()
            .positive()
            .multipleOf(0.01)
            .nullable()
            .optional(),

        costPrice: z
            .number()
            .finite()
            .nonnegative()
            .multipleOf(0.01)
            .nullable()
            .optional(),

        initialStock: z
            .number()
            .int()
            .nonnegative()
            .default(0),

        lowStockThreshold: z
            .number()
            .int()
            .nonnegative()
            .default(3),

        isActive: z.boolean().default(true),

        sortOrder: z.number().int().nonnegative().default(0),
    })
    .strict()
    .superRefine((variant, ctx) => {
        if (
            variant.compareAtPrice !== undefined &&
            variant.compareAtPrice !== null &&
            variant.compareAtPrice <= variant.price
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["compareAtPrice"],
                message: "Compare-at price must be higher than the selling price.",
            });
        }
    });

export const createProductSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "Product name must contain at least 2 characters.")
            .max(200, "Product name must not exceed 200 characters."),

        slug: z
            .string()
            .trim()
            .min(2, "Product slug is required.")
            .max(200, "Product slug must not exceed 200 characters.")
            .regex(
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                "Slug must contain lowercase letters, numbers, and single hyphens only.",
            ),

        shortDescription: z
            .string()
            .trim()
            .max(500, "Short description must not exceed 500 characters.")
            .nullable()
            .optional(),

        description: z.string().trim().nullable().optional(),

        gender: z.enum(["MEN", "WOMEN", "UNISEX"]),

        categoryId: z.string().trim().min(1, "Category is required."),

        material: z.string().trim().nullable().optional(),

        fit: z.string().trim().nullable().optional(),

        careInstructions: z.string().trim().nullable().optional(),

        seoTitle: z.string().trim().nullable().optional(),

        seoDescription: z
            .string()
            .trim()
            .max(320, "SEO description must not exceed 320 characters.")
            .nullable()
            .optional(),

        variants: z
            .array(productVariantSchema)
            .min(1, "At least one product variant is required."),
    })
    .strict()
    .superRefine((product, ctx) => {
        const seenSkus = new Set<string>();
        const seenCombinations = new Set<string>();

        product.variants.forEach((variant, index) => {
            // SKUs must be unique within this product request.
            if (seenSkus.has(variant.sku)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["variants", index, "sku"],
                    message: "Duplicate SKU in this product.",
                });
            }

            seenSkus.add(variant.sku);

            // Each size + colour combination must be unique.
            const combination = `${variant.sizeId}:${variant.colorId}`;

            if (seenCombinations.has(combination)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["variants", index],
                    message: "Duplicate size and colour combination.",
                });
            }

            seenCombinations.add(combination);
        });
    });

export type CreateProductInput = z.infer<typeof createProductSchema>;



export const productListQuerySchema = z
    .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),

        search: z.string().trim().max(200).optional(),

        status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
        gender: z.enum(["MEN", "WOMEN", "UNISEX"]).optional(),

        categoryId: z.string().trim().min(1).optional(),

        sortBy: z.enum(["createdAt", "updatedAt", "name"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
    })
    .strict();

export type ProductListQuery = z.infer<typeof productListQuerySchema>;



const updateProductVariantSchema = z
    .object({
        // Existing variant ID. Omit this when creating a new variant.
        id: z.string().trim().min(1).optional(),

        sku: z
            .string()
            .trim()
            .min(1)
            .max(100)
            .transform((value) => value.toUpperCase()),

        sizeId: z.string().trim().min(1),
        colorId: z.string().trim().min(1),

        price: z.number().finite().positive().multipleOf(0.01),

        compareAtPrice: z
            .number()
            .finite()
            .positive()
            .multipleOf(0.01)
            .nullable()
            .optional(),

        costPrice: z
            .number()
            .finite()
            .nonnegative()
            .multipleOf(0.01)
            .nullable()
            .optional(),

        isActive: z.boolean().optional(),
        sortOrder: z.number().int().nonnegative().optional(),
    })
    .strict()
    .superRefine((variant, ctx) => {
        if (
            variant.compareAtPrice != null &&
            variant.compareAtPrice <= variant.price
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["compareAtPrice"],
                message: "Compare-at price must be higher than the selling price.",
            });
        }
    });

export const updateProductSchema = z
    .object({
        name: z.string().trim().min(2).max(200).optional(),

        slug: z
            .string()
            .trim()
            .min(2)
            .max(200)
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .optional(),

        shortDescription: z.string().trim().max(500).nullable().optional(),
        description: z.string().trim().nullable().optional(),

        gender: z.enum(["MEN", "WOMEN", "UNISEX"]).optional(),

        categoryId: z.string().trim().min(1).optional(),

        material: z.string().trim().nullable().optional(),
        fit: z.string().trim().nullable().optional(),
        careInstructions: z.string().trim().nullable().optional(),

        seoTitle: z.string().trim().nullable().optional(),
        seoDescription: z.string().trim().max(320).nullable().optional(),

        variants: z.array(updateProductVariantSchema).min(1).optional(),
    })
    .strict()
    .superRefine((product, ctx) => {
        const seenIds = new Set<string>();
        const seenSkus = new Set<string>();
        const seenCombinations = new Set<string>();

        product.variants?.forEach((variant, index) => {
            if (variant.id) {
                if (seenIds.has(variant.id)) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["variants", index, "id"],
                        message: "Duplicate variant ID.",
                    });
                }

                seenIds.add(variant.id);
            }

            if (seenSkus.has(variant.sku)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["variants", index, "sku"],
                    message: "Duplicate SKU in this request.",
                });
            }

            seenSkus.add(variant.sku);

            const combination = `${variant.sizeId}:${variant.colorId}`;

            if (seenCombinations.has(combination)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["variants", index],
                    message: "Duplicate size and colour combination.",
                });
            }

            seenCombinations.add(combination);
        });

        if (Object.keys(product).length === 0) {
            ctx.addIssue({
                code: "custom",
                message: "At least one field must be provided for an update.",
            });
        }
    });

export type UpdateProductInput = z.infer<typeof updateProductSchema>;



export const createProductImageSchema = z
    .object({
        publicId: z
            .string()
            .trim()
            .min(1, "Cloudinary public ID is required.")
            .max(500, "Cloudinary public ID is too long.")
            .regex(
                /^pato\/products\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/,
                "Invalid Cloudinary public ID.",
            ),

        variantId: z.string().trim().min(1).nullable().optional(),

        altText: z
            .string()
            .trim()
            .max(300, "Alt text must not exceed 300 characters.")
            .nullable()
            .optional(),

        sortOrder: z.number().int().nonnegative().optional(),

        isPrimary: z.boolean().optional(),
    })
    .strict();

export type CreateProductImageInput = z.infer<
    typeof createProductImageSchema
>;
