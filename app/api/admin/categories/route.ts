
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
    AuthorizationError,
    requireAdmin,
} from "@/lib/auth/guards";

const querySchema = z.object({
    search: z.string().trim().max(100).optional(),
    isActive: z.enum(["true", "false"]).optional(),
});

const createCategorySchema = z.object({
    name: z.string().trim().min(2).max(100),

    slug: z
        .string()
        .trim()
        .min(2)
        .max(120)
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must contain lowercase letters, numbers and hyphens only.",
        ),

    description: z.string().trim().max(1000).optional(),

    imageUrl: z.string().trim().url().optional(),

    isActive: z.boolean().optional(),

    sortOrder: z.number().int().min(0).max(10000).optional(),

    parentId: z.string().trim().min(1).max(100).nullable().optional(),
}).strict();

function isUniqueConstraintError(error: unknown) {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
    );
}

// GET /api/admin/categories
export async function GET(request: Request) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(request.url);

        const parsedQuery = querySchema.safeParse({
            search: searchParams.get("search") ?? undefined,
            isActive: searchParams.get("isActive") ?? undefined,
        });

        if (!parsedQuery.success) {
            return NextResponse.json(
                {
                    message: "Invalid query parameters.",
                    errors: parsedQuery.error.flatten(),
                },
                { status: 400 },
            );
        }

        const { search, isActive } = parsedQuery.data;

        const categories = await prisma.category.findMany({
            where: {
                ...(search
                    ? {
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
                    }
                    : {}),

                ...(isActive !== undefined
                    ? { isActive: isActive === "true" }
                    : {}),
            },

            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                imageUrl: true,
                isActive: true,
                sortOrder: true,
                parentId: true,
                createdAt: true,
                updatedAt: true,

                _count: {
                    select: {
                        children: true,
                        products: true,
                    },
                },
            },

            orderBy: [
                { sortOrder: "asc" },
                { name: "asc" },
            ],
        });

        return NextResponse.json(
            {
                categories,
                totalCategories: categories.length,
            },
            {
                status: 200,
                headers: {
                    "Cache-Control": "no-store",
                },
            },
        );
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status },
            );
        }

        console.error("Admin category listing error:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}

// POST /api/admin/categories
export async function POST(request: Request) {
    try {
        await requireAdmin();

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { message: "Invalid JSON request body." },
                { status: 400 },
            );
        }

        const parsedBody = createCategorySchema.safeParse(body);

        if (!parsedBody.success) {
            return NextResponse.json(
                {
                    message: "Invalid category information.",
                    errors: parsedBody.error.flatten(),
                },
                { status: 400 },
            );
        }

        const data = parsedBody.data;

        // Validate the parent category, if supplied.
        if (data.parentId) {
            const parentCategory = await prisma.category.findUnique({
                where: {
                    id: data.parentId,
                },
                select: {
                    id: true,
                    isActive: true,
                },
            });

            if (!parentCategory) {
                return NextResponse.json(
                    { message: "Parent category not found." },
                    { status: 404 },
                );
            }

            if (!parentCategory.isActive) {
                return NextResponse.json(
                    {
                        message:
                            "Cannot create a category under an inactive parent category.",
                    },
                    { status: 400 },
                );
            }
        }

        const category = await prisma.category.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                imageUrl: data.imageUrl,
                isActive: data.isActive ?? true,
                sortOrder: data.sortOrder ?? 0,
                ...(data.parentId !== undefined
                    ? { parentId: data.parentId }
                    : {}),
            },

            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                imageUrl: true,
                isActive: true,
                sortOrder: true,
                parentId: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(
            {
                message: "Category created successfully.",
                category,
            },
            {
                status: 201,
                headers: {
                    "Cache-Control": "no-store",
                },
            },
        );
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status },
            );
        }

        if (isUniqueConstraintError(error)) {
            return NextResponse.json(
                {
                    message:
                        "A category with this slug already exists.",
                },
                { status: 409 },
            );
        }

        console.error("Admin category creation error:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}
