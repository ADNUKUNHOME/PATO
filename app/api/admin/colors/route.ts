
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
    AuthorizationError,
    requireAdmin,
} from "@/lib/auth/guards";

const colorSchema = z.object({
    name: z.string().trim().min(1).max(50),

    slug: z
        .string()
        .trim()
        .min(1)
        .max(60)
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must contain lowercase letters, numbers, and hyphens."
        ),

    hexCode: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color.")
        .transform((value) => value.toUpperCase())
        .optional(),

    isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
    try {
        await requireAdmin();

        const searchParams = request.nextUrl.searchParams;

        const search = searchParams.get("search")?.trim();
        const isActiveParam = searchParams.get("isActive");

        if (
            isActiveParam !== null &&
            !["true", "false"].includes(isActiveParam)
        ) {
            return NextResponse.json(
                { message: "Invalid isActive value." },
                { status: 400 }
            );
        }

        const colors = await prisma.color.findMany({
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

                ...(isActiveParam !== null
                    ? { isActive: isActiveParam === "true" }
                    : {}),
            },

            include: {
                _count: {
                    select: {
                        variants: true,
                    },
                },
            },

            orderBy: [
                { name: "asc" },
            ],
        });

        return NextResponse.json({ colors }, { status: 200 });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status }
            );
        }

        console.error("GET /api/admin/colors error:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAdmin();

        const body: unknown = await request.json();
        const validation = colorSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    message: "Invalid color data.",
                    errors: z.flattenError(validation.error),
                },
                { status: 400 }
            );
        }

        const color = await prisma.color.create({
            data: validation.data,
        });

        return NextResponse.json(
            {
                message: "Color created successfully.",
                color,
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status }
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

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { message: "Invalid JSON body." },
                { status: 400 }
            );
        }

        console.error("POST /api/admin/colors error:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}
