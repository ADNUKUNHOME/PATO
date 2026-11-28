
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

import {
    requireAdmin,
    AuthorizationError,
} from "@/lib/auth/guards";

type RouteContext = {
    params: Promise<{
        productId: string;
    }>;
};

import { updateProductSchema } from "@/lib/validations/product";


export async function GET(
    request: Request,
    { params }: RouteContext,
) {
    try {
        // 1. Authenticate and authorize the admin.
        await requireAdmin();

        // 2. Retrieve the product ID from route parameters.
        const { productId } = await params;

        if (!productId || !productId.trim()) {
            return NextResponse.json(
                { message: "Product ID is required." },
                { status: 400 },
            );
        }

        // 3. Retrieve complete product details.
        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            },

            include: {
                category: true,

                images: {
                    orderBy: [
                        { sortOrder: "asc" },
                        { createdAt: "asc" },
                    ],
                },

                variants: {
                    orderBy: [
                        { sortOrder: "asc" },
                        { createdAt: "asc" },
                    ],

                    include: {
                        size: true,
                        color: true,

                        images: {
                            orderBy: [
                                { sortOrder: "asc" },
                                { createdAt: "asc" },
                            ],
                        },

                        inventory: {
                            include: {
                                movements: {
                                    orderBy: {
                                        createdAt: "desc",
                                    },
                                    take: 10,
                                },
                            },
                        },
                    },
                },
            },
        });

        // 4. Handle products that do not exist.
        if (!product) {
            return NextResponse.json(
                { message: "Product not found." },
                { status: 404 },
            );
        }

        // 5. Return complete product details.
        return NextResponse.json({
            message: "Product retrieved successfully.",
            product,
        });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status },
            );
        }

        console.error("Product retrieval error:", error);

        return NextResponse.json(
            {
                message: "An unexpected error occurred while retrieving the product.",
            },
            { status: 500 },
        );
    }
}



export async function PATCH(
    request: Request,
    { params }: RouteContext
) {
    try {
        const currentUser = await requireAdmin();

        const { productId } = await params;

        if (!productId || !productId.trim()) {
            return NextResponse.json(
                { message: "Invalid product ID." },
                { status: 400 }
            );
        }

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { message: "Invalid JSON request body." },
                { status: 400 }
            );
        }

        const validation = updateProductSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    message: "Validation failed.",
                    errors: validation.error.flatten(),
                },
                { status: 400 }
            );
        }

        const data = validation.data;

        const updatedProduct = await prisma.$transaction(
            async (tx) => {
                const existingProduct = await tx.product.findUnique({
                    where: { id: productId },
                    include: {
                        variants: true,
                    },
                });

                if (!existingProduct) {
                    throw new Error("PRODUCT_NOT_FOUND");
                }

                // Validate category if it is being changed.
                if (data.categoryId) {
                    const category = await tx.category.findUnique({
                        where: { id: data.categoryId },
                        select: { id: true, isActive: true },
                    });

                    if (!category || !category.isActive) {
                        throw new Error("INVALID_CATEGORY");
                    }
                }

                if (data.variants) {
                    const existingVariantIds = new Set(
                        existingProduct.variants.map((variant) => variant.id)
                    );

                    const existingVariantSkus = new Map(
                        existingProduct.variants.map((variant) => [
                            variant.sku,
                            variant.id,
                        ])
                    );

                    // Every supplied variant ID must belong to this product.
                    for (const variant of data.variants) {
                        if (variant.id && !existingVariantIds.has(variant.id)) {
                            throw new Error("INVALID_VARIANT_ID");
                        }
                    }

                    // Validate SKU uniqueness across the database.
                    const skus = data.variants.map((variant) => variant.sku);

                    const conflictingSkus = await tx.productVariant.findMany({
                        where: {
                            sku: { in: skus },
                            NOT: {
                                id: {
                                    in: data.variants
                                        .map((variant) => variant.id)
                                        .filter((id): id is string => Boolean(id)),
                                },
                            },
                        },
                        select: {
                            id: true,
                            sku: true,
                        },
                    });

                    // A SKU can remain on its existing variant, but cannot belong
                    // to another variant.
                    if (
                        conflictingSkus.some(
                            (variant) =>
                                !existingVariantIds.has(variant.id) ||
                                existingVariantSkus.get(variant.sku) !== variant.id
                        )
                    ) {
                        throw new Error("DUPLICATE_SKU");
                    }

                    const sizeIds = [
                        ...new Set(data.variants.map((variant) => variant.sizeId)),
                    ];

                    const colorIds = [
                        ...new Set(data.variants.map((variant) => variant.colorId)),
                    ];

                    const [sizes, colors] = await Promise.all([
                        tx.size.findMany({
                            where: {
                                id: { in: sizeIds },
                                isActive: true,
                            },
                            select: { id: true },
                        }),
                        tx.color.findMany({
                            where: {
                                id: { in: colorIds },
                                isActive: true,
                            },
                            select: { id: true },
                        }),
                    ]);

                    if (sizes.length !== sizeIds.length) {
                        throw new Error("INVALID_SIZE");
                    }

                    if (colors.length !== colorIds.length) {
                        throw new Error("INVALID_COLOR");
                    }

                    // Prevent duplicate combinations against variants that
                    // are not being updated.
                    const submittedVariantIds = data.variants
                        .map((variant) => variant.id)
                        .filter((id): id is string => Boolean(id));

                    const remainingVariants = existingProduct.variants.filter(
                        (variant) => !submittedVariantIds.includes(variant.id)
                    );

                    const combinations = new Set<string>();

                    for (const variant of remainingVariants) {
                        combinations.add(
                            `${variant.sizeId}:${variant.colorId}`
                        );
                    }

                    for (const variant of data.variants) {
                        const combination = `${variant.sizeId}:${variant.colorId}`;

                        if (combinations.has(combination)) {
                            throw new Error("DUPLICATE_VARIANT_COMBINATION");
                        }

                        combinations.add(combination);
                    }
                }

                const {
                    variants,
                    ...productData
                } = data;

                await tx.product.update({
                    where: { id: productId },
                    data: productData,
                });

                if (variants) {
                    for (const variant of variants) {
                        const {
                            id,
                            sku,
                            sizeId,
                            colorId,
                            price,
                            compareAtPrice,
                            costPrice,
                            isActive,
                            sortOrder,
                        } = variant;

                        const variantData = {
                            sku,
                            sizeId,
                            colorId,
                            price,
                            ...(compareAtPrice !== undefined && { compareAtPrice }),
                            ...(costPrice !== undefined && { costPrice }),
                            ...(isActive !== undefined && { isActive }),
                            ...(sortOrder !== undefined && { sortOrder }),
                        };

                        if (id) {
                            await tx.productVariant.update({
                                where: { id },
                                data: variantData,
                            });
                        } else {
                            const createdVariant = await tx.productVariant.create({
                                data: {
                                    productId,
                                    ...variantData,
                                    currency: "INR",
                                    inventory: {
                                        create: {
                                            quantity: 0,
                                            reservedQuantity: 0,
                                            lowStockThreshold: 3,
                                        },
                                    },
                                },
                            });

                            // No initial stock is added here.
                            // Stock must be added through inventory management.
                            void createdVariant;
                        }
                    }
                }

                return tx.product.findUniqueOrThrow({
                    where: { id: productId },
                    include: {
                        category: true,
                        variants: {
                            orderBy: [
                                { sortOrder: "asc" },
                                { createdAt: "asc" },
                            ],
                            include: {
                                size: true,
                                color: true,
                                inventory: true,
                            },
                        },
                        images: {
                            orderBy: [
                                { sortOrder: "asc" },
                                { createdAt: "asc" },
                            ],
                        },
                    },
                });
            },
            {
                maxWait: 10000,
                timeout: 15000,
            }
        );

        return NextResponse.json({
            message: "Product updated successfully.",
            product: updatedProduct,
        });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status }
            );
        }

        if (error instanceof Error) {
            const errors: Record<string, { status: number; message: string }> = {
                PRODUCT_NOT_FOUND: {
                    status: 404,
                    message: "Product not found.",
                },
                INVALID_CATEGORY: {
                    status: 400,
                    message: "Category does not exist or is inactive.",
                },
                INVALID_VARIANT_ID: {
                    status: 400,
                    message: "A variant does not belong to this product.",
                },
                DUPLICATE_SKU: {
                    status: 409,
                    message: "One or more SKUs are already in use.",
                },
                INVALID_SIZE: {
                    status: 400,
                    message: "One or more sizes do not exist or are inactive.",
                },
                INVALID_COLOR: {
                    status: 400,
                    message: "One or more colours do not exist or are inactive.",
                },
                DUPLICATE_VARIANT_COMBINATION: {
                    status: 409,
                    message: "A size and colour combination already exists.",
                },
            };

            const knownError = errors[error.message];

            if (knownError) {
                return NextResponse.json(
                    { message: knownError.message },
                    { status: knownError.status }
                );
            }
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { message: "A product slug or variant SKU is already in use." },
                { status: 409 }
            );
        }

        console.error("PATCH /api/admin/products/[productId] error:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}
