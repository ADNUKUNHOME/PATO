
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
    AuthorizationError,
    requireAdmin,
} from "@/lib/auth/guards";

const paramsSchema = z.object({
    categoryId: z.string().trim().min(1).max(100),
});

const updateCategorySchema = z.object({
    name: z.string().trim().min(2).max(100).optional(),

    slug: z
        .string()
        .trim()
        .min(2)
        .max(120)
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must contain lowercase letters, numbers and hyphens only.",
        )
        .optional(),

    description: z.string().trim().max(1000).nullable().optional(),

    imageUrl: z.string().trim().url().nullable().optional(),

    isActive: z.boolean().optional(),

    sortOrder: z.number().int().min(0).max(10000).optional(),

    parentId: z.string().trim().min(1).max(100).nullable().optional(),
})
    .strict()
    .refine(
        (data) => Object.keys(data).length > 0,
        "Provide at least one field to update.",
    );

type RouteContext = {
    params: Promise<{
        categoryId: string;
    }>;
};

function isUniqueConstraintError(error: unknown) {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
    );
}

export async function PATCH(
    request: Request,
    { params }: RouteContext,
) {
    try {
        await requireAdmin();

        // 1. Validate category ID.
        const { categoryId } = await params;

        const parsedParams = paramsSchema.safeParse({
            categoryId,
        });

        if (!parsedParams.success) {
            return NextResponse.json(
                { message: "Invalid category ID." },
                { status: 400 },
            );
        }

        // 2. Validate request body.
        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { message: "Invalid JSON request body." },
                { status: 400 },
            );
        }

        const parsedBody = updateCategorySchema.safeParse(body);

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
        const id = parsedParams.data.categoryId;

        // 3. Check whether the category exists.
        const existingCategory = await prisma.category.findUnique({
            where: { id },
            select: {
                id: true,
                parentId: true,
                isActive: true,
            },
        });

        if (!existingCategory) {
            return NextResponse.json(
                { message: "Category not found." },
                { status: 404 },
            );
        }

        // 4. Determine the category's resulting parent.
        const nextParentId =
            data.parentId !== undefined
                ? data.parentId
                : existingCategory.parentId;

        // 5. Validate the parent hierarchy.
        if (nextParentId !== null) {
            if (nextParentId === id) {
                return NextResponse.json(
                    {
                        message: "A category cannot be its own parent.",
                    },
                    { status: 400 },
                );
            }

            let ancestorId: string | null = nextParentId;

            while (ancestorId !== null) {
                if (ancestorId === id) {
                    return NextResponse.json(
                        {
                            message:
                                "A category cannot be moved under one of its descendants.",
                        },
                        { status: 400 },
                    );
                }

                const ancestor: { isActive: boolean; parentId: string | null } | null =
                    await prisma.category.findUnique({
                        where: { id: ancestorId },
                        select: {
                            parentId: true,
                            isActive: true,
                        },
                    });

                if (!ancestor) {
                    return NextResponse.json(
                        { message: "Parent category not found." },
                        { status: 404 },
                    );
                }

                if (!ancestor.isActive) {
                    return NextResponse.json(
                        {
                            message:
                                "A category cannot be placed under an inactive parent category.",
                        },
                        { status: 400 },
                    );
                }

                ancestorId = ancestor.parentId;
            }
        }

        // 6. Prevent deactivating a category with active children.
        if (data.isActive === false) {
            const activeChildren = await prisma.category.count({
                where: {
                    parentId: id,
                    isActive: true,
                },
            });

            if (activeChildren > 0) {
                return NextResponse.json(
                    {
                        message:
                            "Deactivate all child categories before deactivating this category.",
                    },
                    { status: 409 },
                );
            }
        }

        // 7. Update the category.
        const category = await prisma.category.update({
            where: { id },

            data: {
                ...data,
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
                message: "Category updated successfully.",
                category,
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

        if (isUniqueConstraintError(error)) {
            return NextResponse.json(
                {
                    message:
                        "A category with this slug already exists.",
                },
                { status: 409 },
            );
        }

        console.error("Admin category update error:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}
