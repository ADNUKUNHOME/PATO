
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
    AuthorizationError,
    requireAdmin,
} from "@/lib/auth/guards";

const sizeSchema = z.object({
    name: z.string().trim().min(1).max(50),
    code: z
        .string()
        .trim()
        .min(1)
        .max(20)
        .regex(/^[a-zA-Z0-9_-]+$/, "Invalid size code.")
        .transform((value) => value.toUpperCase()),
    type: z.enum(["LETTER", "NUMERIC", "ONE_SIZE", "OTHER"]),
    sortOrder: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
    try {
        await requireAdmin();

        const searchParams = request.nextUrl.searchParams;

        const search = searchParams.get("search")?.trim();
        const type = searchParams.get("type");
        const isActiveParam = searchParams.get("isActive");

        if (
            type &&
            !["LETTER", "NUMERIC", "ONE_SIZE", "OTHER"].includes(type)
        ) {
            return NextResponse.json(
                { message: "Invalid size type." },
                { status: 400 }
            );
        }

        if (
            isActiveParam !== null &&
            !["true", "false"].includes(isActiveParam)
        ) {
            return NextResponse.json(
                { message: "Invalid isActive value." },
                { status: 400 }
            );
        }

        const sizes = await prisma.size.findMany({
            where: {
                ...(search
                    ? {
                        OR: [
                            { name: { contains: search, mode: "insensitive" } },
                            { code: { contains: search, mode: "insensitive" } },
                        ],
                    }
                    : {}),
                ...(type ? { type: type as "LETTER" | "NUMERIC" | "ONE_SIZE" | "OTHER" } : {}),
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
                { type: "asc" },
                { sortOrder: "asc" },
                { name: "asc" },
            ],
        });

        return NextResponse.json({ sizes }, { status: 200 });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status }
            );
        }

        console.error("GET /api/admin/sizes error:", error);

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
        const validation = sizeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    message: "Invalid size data.",
                    errors: z.flattenError(validation.error),
                },
                { status: 400 }
            );
        }

        const size = await prisma.size.create({
            data: validation.data,
        });

        return NextResponse.json(
            {
                message: "Size created successfully.",
                size,
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
                { message: "A size with this type and code already exists." },
                { status: 409 }
            );
        }

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { message: "Invalid JSON body." },
                { status: 400 }
            );
        }

        console.error("POST /api/admin/sizes error:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}
