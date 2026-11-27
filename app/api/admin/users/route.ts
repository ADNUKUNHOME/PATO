
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
    AuthorizationError,
    requireAdmin,
} from "@/lib/auth/guards";

const querySchema = z.object({
    page: z.coerce.number().int().min(1).max(1_000_000).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    search: z
        .string()
        .trim()
        .max(100)
        .optional()
        .transform((value) => value || undefined),

    role: z
        .enum(["customer", "admin", "super_admin"])
        .optional(),
});

const userSelect = {
    id: true,
    name: true,
    email: true,
    emailVerified: true,
    image: true,
    phone: true,
    phoneVerified: true,
    role: true,
    banned: true,
    createdAt: true,
    updatedAt: true,
} as const;

// GET /api/admin/users
export async function GET(request: Request) {
    try {
        // Only admins and super admins can access this endpoint.
        await requireAdmin();

        const { searchParams } = new URL(request.url);

        const validation = querySchema.safeParse({
            page: searchParams.get("page") ?? undefined,
            limit: searchParams.get("limit") ?? undefined,
            search: searchParams.get("search") ?? undefined,
            role: searchParams.get("role") ?? undefined,
        });

        if (!validation.success) {
            return NextResponse.json(
                {
                    message: "Invalid query parameters.",
                    errors: validation.error.flatten(),
                },
                { status: 400 },
            );
        }

        const { page, limit, search, role } = validation.data;

        const skip = (page - 1) * limit;

        // Build the database filters.
        const where = {
            ...(role ? { role } : {}),

            ...(search
                ? {
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            email: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            phone: {
                                contains: search,
                            },
                        },
                    ],
                }
                : {}),
        };

        // Execute the count and paginated query concurrently.
        const [totalUsers, users] = await Promise.all([
            prisma.user.count({
                where,
            }),

            prisma.user.findMany({
                where,
                select: userSelect,
                orderBy: [
                    { createdAt: "desc" },
                    { id: "desc" },
                ],
                skip,
                take: limit,
            }),
        ]);

        const totalPages = Math.ceil(totalUsers / limit);

        return NextResponse.json({
            users,

            pagination: {
                page,
                limit,
                totalUsers,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1 && totalPages > 0,
            },
        });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status },
            );
        }

        console.error("GET /api/admin/users:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}