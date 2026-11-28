
import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin, AuthorizationError } from "@/lib/auth/guards";
import { createProductSchema } from "@/lib/validations/product";

import { productListQuerySchema } from "@/lib/validations/product";



export async function GET(request: Request) {
    try {
        // 1. Authenticate and authorize the admin.
        await requireAdmin();

        // 2. Parse and validate query parameters.
        const searchParams = new URL(request.url).searchParams;

        const queryValidation = productListQuerySchema.safeParse(
            Object.fromEntries(searchParams.entries()),
        );

        if (!queryValidation.success) {
            return NextResponse.json(
                {
                    message: "Invalid product query parameters.",
                    errors: queryValidation.error.flatten(),
                },
                { status: 400 },
            );
        }

        const {
            page,
            limit,
            search,
            status,
            gender,
            categoryId,
            sortBy,
            sortOrder,
        } = queryValidation.data;

        // 3. Build the database filters.
        const where: Prisma.ProductWhereInput = {
            ...(status && { status }),
            ...(gender && { gender }),
            ...(categoryId && { categoryId }),

            ...(search && {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        slug: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            }),
        };

        // 4. Configure sorting.
        const orderBy: Prisma.ProductOrderByWithRelationInput =
            sortBy === "name"
                ? { name: sortOrder }
                : sortBy === "updatedAt"
                    ? { updatedAt: sortOrder }
                    : { createdAt: sortOrder };

        // 5. Retrieve products and total count.
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy,

                select: {
                    id: true,
                    name: true,
                    slug: true,
                    shortDescription: true,
                    status: true,
                    gender: true,
                    categoryId: true,
                    publishedAt: true,
                    archivedAt: true,
                    createdAt: true,
                    updatedAt: true,

                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },

                    _count: {
                        select: {
                            variants: true,
                            images: true,
                        },
                    },

                    variants: {
                        select: {
                            isActive: true,
                            price: true,

                            inventory: {
                                select: {
                                    quantity: true,
                                    reservedQuantity: true,
                                },
                            },
                        },
                    },
                },
            }),

            prisma.product.count({ where }),
        ]);

        // 6. Build useful product summaries.
        const formattedProducts = products.map((product) => {
            const activeVariants = product.variants.filter(
                (variant) => variant.isActive,
            );

            const prices = activeVariants.map(
                (variant) => Number(variant.price),
            );

            const totalStock = product.variants.reduce(
                (total, variant) =>
                    total + (variant.inventory?.quantity ?? 0),
                0,
            );

            const availableStock = product.variants.reduce(
                (total, variant) => {
                    const quantity = variant.inventory?.quantity ?? 0;
                    const reserved = variant.inventory?.reservedQuantity ?? 0;

                    return total + Math.max(quantity - reserved, 0);
                },
                0,
            );

            const {
                variants,
                ...productDetails
            } = product;

            return {
                ...productDetails,

                variantCount: product._count.variants,
                activeVariantCount: activeVariants.length,
                imageCount: product._count.images,

                totalStock,
                availableStock,

                minPrice: prices.length > 0 ? Math.min(...prices) : null,
                maxPrice: prices.length > 0 ? Math.max(...prices) : null,
            };
        });

        // 7. Return paginated results.
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            message: "Products retrieved successfully.",

            products: formattedProducts,

            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status },
            );
        }

        console.error("Product listing error:", error);

        return NextResponse.json(
            { message: "An unexpected error occurred while retrieving products." },
            { status: 500 },
        );
    }
}



export async function POST(request: Request) {
    try {
        // 1. Authenticate and authorize the admin.
        const currentUser = await requireAdmin();

        // 2. Parse and validate the request body.
        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { message: "Invalid JSON request body." },
                { status: 400 },
            );
        }

        const validation = createProductSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    message: "Product validation failed.",
                    errors: validation.error.flatten(),
                },
                { status: 400 },
            );
        }

        const data = validation.data;

        // 3. Create product and related records atomically.
        const product = await prisma.$transaction(
            async (tx) => {
                // Verify category.
                const category = await tx.category.findUnique({
                    where: { id: data.categoryId },
                    select: { id: true, isActive: true },
                });

                if (!category || !category.isActive) {
                    throw new Error("INVALID_CATEGORY");
                }

                // Collect unique size and colour IDs.
                const sizeIds = [...new Set(data.variants.map((v) => v.sizeId))];
                const colorIds = [...new Set(data.variants.map((v) => v.colorId))];

                // Verify active sizes and colours.
                const [sizes, colors] = await Promise.all([
                    tx.size.findMany({
                        where: { id: { in: sizeIds }, isActive: true },
                        select: { id: true },
                    }),
                    tx.color.findMany({
                        where: { id: { in: colorIds }, isActive: true },
                        select: { id: true },
                    }),
                ]);

                if (sizes.length !== sizeIds.length) {
                    throw new Error("INVALID_SIZE");
                }

                if (colors.length !== colorIds.length) {
                    throw new Error("INVALID_COLOR");
                }

                // Check existing SKUs.
                const skus = data.variants.map((variant) => variant.sku);

                const existingSkus = await tx.productVariant.findMany({
                    where: { sku: { in: skus } },
                    select: { sku: true },
                });

                if (existingSkus.length > 0) {
                    throw new Error("DUPLICATE_SKU");
                }

                // Create product, variants and inventory.
                const createdProduct = await tx.product.create({
                    data: {
                        name: data.name,
                        slug: data.slug,
                        shortDescription: data.shortDescription ?? null,
                        description: data.description ?? null,
                        gender: data.gender,
                        categoryId: data.categoryId,
                        material: data.material ?? null,
                        fit: data.fit ?? null,
                        careInstructions: data.careInstructions ?? null,
                        seoTitle: data.seoTitle ?? null,
                        seoDescription: data.seoDescription ?? null,

                        variants: {
                            create: data.variants.map((variant) => ({
                                sku: variant.sku,
                                sizeId: variant.sizeId,
                                colorId: variant.colorId,
                                price: variant.price,
                                compareAtPrice: variant.compareAtPrice ?? null,
                                costPrice: variant.costPrice ?? null,
                                isActive: variant.isActive,
                                sortOrder: variant.sortOrder,

                                inventory: {
                                    create: {
                                        quantity: variant.initialStock,
                                        lowStockThreshold: variant.lowStockThreshold,
                                    },
                                },
                            })),
                        },
                    },

                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                        variants: {
                            orderBy: { sortOrder: "asc" },
                            include: {
                                size: true,
                                color: true,
                                inventory: true,
                            },
                        },
                    },
                });

                // Create initial stock movements after variant IDs are available.
                const initialStockMovements = createdProduct.variants
                    .filter(
                        (variant) =>
                            variant.inventory !== null &&
                            variant.inventory.quantity > 0,
                    )
                    .map((variant) => ({
                        inventoryId: variant.inventory!.id,
                        type: "STOCK_IN" as const,
                        quantity: variant.inventory!.quantity,
                        reason: "Initial stock on product creation",
                        referenceType: "PRODUCT_VARIANT",
                        referenceId: variant.id,
                        createdByUserId: currentUser.id,
                    }));

                if (initialStockMovements.length > 0) {
                    await tx.inventoryMovement.createMany({
                        data: initialStockMovements,
                    });
                }

                // Return product from the transaction.
                return createdProduct;
            },
            {
                maxWait: 10000,
                timeout: 15000,
            },
        );

        // 4. Return the successfully created product.
        return NextResponse.json(
            {
                message: "Product created successfully.",
                product,
            },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status },
            );
        }

        if (error instanceof Error) {
            const businessErrors: Record<string, string> = {
                INVALID_CATEGORY: "Selected category does not exist or is inactive.",
                INVALID_SIZE: "One or more selected sizes do not exist or are inactive.",
                INVALID_COLOR: "One or more selected colours do not exist or are inactive.",
                DUPLICATE_SKU: "One or more SKUs already exist.",
            };

            const message = businessErrors[error.message];

            if (message) {
                return NextResponse.json(
                    { message },
                    { status: 400 },
                );
            }
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            const target = error.meta?.target;

            if (Array.isArray(target) && target.includes("slug")) {
                return NextResponse.json(
                    { message: "A product with this slug already exists." },
                    { status: 409 },
                );
            }

            if (Array.isArray(target) && target.includes("sku")) {
                return NextResponse.json(
                    { message: "One or more SKUs already exist." },
                    { status: 409 },
                );
            }

            return NextResponse.json(
                { message: "A record with these unique values already exists." },
                { status: 409 },
            );
        }

        console.error("Product creation error:", error);

        return NextResponse.json(
            {
                message: "An unexpected error occurred while creating the product.",
            },
            { status: 500 },
        );
    }
}

