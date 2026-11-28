
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
