
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
    requireAdmin,
    AuthorizationError,
} from "@/lib/auth/guards";

type RouteContext = {
    params: Promise<{
        productId: string;
    }>;
};

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
