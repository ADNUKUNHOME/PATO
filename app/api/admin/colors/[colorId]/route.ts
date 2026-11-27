
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
    AuthorizationError,
    requireAdmin,
} from "@/lib/auth/guards";

const colorUpdateSchema = z
    .object({
        name: z.string().trim().min(1).max(50).optional(),

        slug: z
            .string()
            .trim()
            .min(1)
            .max(60)
            .regex(
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                "Slug must contain lowercase letters, numbers, and hyphens."
            )
            .optional(),

        hexCode: z
            .string()
            .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color.")
            .transform((value) => value.toUpperCase())
            .nullable()
            .optional(),

        isActive: z.boolean().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided.",
    });

type RouteContext = {
    params: Promise<{
        colorId: string;
    }>;
};

export async function PATCH(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        await requireAdmin();

        const { colorId } = await params;

        if (!colorId?.trim()) {
            return NextResponse.json(
                { message: "Invalid color ID." },
                { status: 400 }
            );
        }

        const body: unknown = await request.json();
        const validation = colorUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    message: "Invalid color data.",
                    errors: z.flattenError(validation.error),
                },
                { status: 400 }
            );
        }

        const updateData = validation.data;

        const result = await prisma.$transaction(async (tx) => {
            const existingColor = await tx.color.findUnique({
                where: { id: colorId },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    hexCode: true,
                    isActive: true,
                    _count: {
                        select: {
                            variants: true,
                        },
                    },
                },
            });

            if (!existingColor) {
                return { status: "NOT_FOUND" as const };
            }

            const hasVariants = existingColor._count.variants > 0;

            const changingSlug =
                updateData.slug !== undefined &&
                updateData.slug !== existingColor.slug;

            const changingHexCode =
                updateData.hexCode !== undefined &&
                updateData.hexCode !== existingColor.hexCode;

            if (hasVariants && (changingSlug || changingHexCode)) {
                return { status: "LOCKED" as const };
            }

            const color = await tx.color.update({
                where: { id: colorId },
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
                color,
            };
        });

        if (result.status === "NOT_FOUND") {
            return NextResponse.json(
                { message: "Color not found." },
                { status: 404 }
            );
        }

        if (result.status === "LOCKED") {
            return NextResponse.json(
                {
                    message:
                        "Color slug and hex code cannot be changed because this color is already used by product variants.",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                message: "Color updated successfully.",
                color: result.color,
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
                { message: "A color with this slug already exists." },
                { status: 409 }
            );
        }

        console.error(
            "PATCH /api/admin/colors/[colorId] error:",
            error
        );

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}
