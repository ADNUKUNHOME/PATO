
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
    AuthorizationError,
    requireAdmin,
} from "@/lib/auth/guards";

const sizeUpdateSchema = z
    .object({
        name: z.string().trim().min(1).max(50).optional(),

        code: z
            .string()
            .trim()
            .min(1)
            .max(20)
            .regex(/^[a-zA-Z0-9_-]+$/, "Invalid size code.")
            .transform((value) => value.toUpperCase())
            .optional(),

        type: z
            .enum(["LETTER", "NUMERIC", "ONE_SIZE", "OTHER"])
            .optional(),

        sortOrder: z.number().int().min(0).optional(),

        isActive: z.boolean().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided.",
    });

type RouteContext = {
    params: Promise<{
        sizeId: string;
    }>;
};

export async function PATCH(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        await requireAdmin();

        const { sizeId } = await params;

        if (!sizeId?.trim()) {
            return NextResponse.json(
                { message: "Invalid size ID." },
                { status: 400 }
            );
        }

        const body: unknown = await request.json();
        const validation = sizeUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    message: "Invalid size data.",
                    errors: z.flattenError(validation.error),
                },
                { status: 400 }
            );
        }

        const updateData = validation.data;

        const result = await prisma.$transaction(
            async (tx) => {
                const existingSize = await tx.size.findUnique({
                    where: { id: sizeId },
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        type: true,
                        sortOrder: true,
                        isActive: true,
                        _count: {
                            select: {
                                variants: true,
                            },
                        },
                    },
                });

                if (!existingSize) {
                    return { status: "NOT_FOUND" as const };
                }

                const hasVariants = existingSize._count.variants > 0;

                const changingCode =
                    updateData.code !== undefined &&
                    updateData.code !== existingSize.code;

                const changingType =
                    updateData.type !== undefined &&
                    updateData.type !== existingSize.type;

                if (hasVariants && (changingCode || changingType)) {
                    return { status: "LOCKED" as const };
                }

                const updatedSize = await tx.size.update({
                    where: { id: sizeId },
                    data: updateData,
                    include: {
                        _count: {
                            select: {
                                variants: true,
                            },
                        },
                    },
                });

                return {
                    status: "UPDATED" as const,
                    size: updatedSize,
                };
            }
        );

        if (result.status === "NOT_FOUND") {
            return NextResponse.json(
                { message: "Size not found." },
                { status: 404 }
            );
        }

        if (result.status === "LOCKED") {
            return NextResponse.json(
                {
                    message:
                        "Size code and type cannot be changed because this size is already used by product variants.",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                message: "Size updated successfully.",
                size: result.size,
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status }
            );
        }

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { message: "Invalid JSON body." },
                { status: 400 }
            );
        }

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                {
                    message:
                        "A size with this type and code already exists.",
                },
                { status: 409 }
            );
        }

        console.error("PATCH /api/admin/sizes/[sizeId] error:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}
