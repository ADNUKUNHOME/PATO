
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { AuthorizationError, requireAuthenticatedUser } from "@/lib/auth/guards";


const profileSelect = {
    id: true,
    name: true,
    email: true,
    emailVerified: true,
    image: true,
    phone: true,
    phoneVerified: true,
    createdAt: true,
    updatedAt: true,
} as const;

const updateProfileSchema = z
    .object({
        name: z.string().trim().min(2).max(80),
    })
    .strict();

export async function GET() {
    try {
        const currentUser = await requireAuthenticatedUser();

        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: profileSelect,
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found." },
                { status: 404 },
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status },
            );
        }

        console.error("GET /api/users/me:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const currentUser = await requireAuthenticatedUser();

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { message: "Invalid JSON body." },
                { status: 400 },
            );
        }

        const validation = updateProfileSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    message: "Invalid profile data.",
                    errors: validation.error.flatten(),
                },
                { status: 400 },
            );
        }

        const user = await prisma.user.update({
            where: { id: currentUser.id },
            data: validation.data,
            select: profileSelect,
        });

        return NextResponse.json({
            message: "Profile updated successfully.",
            user,
        });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status },
            );
        }

        console.error("PATCH /api/users/me:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}
