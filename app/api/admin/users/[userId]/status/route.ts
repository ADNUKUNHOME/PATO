
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
    AuthorizationError,
    requireSuperAdmin,
} from "@/lib/auth/guards";

const paramsSchema = z.object({
    userId: z.string().trim().min(1).max(100),
});

const bodySchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal("ban"),
        reason: z.string().trim().max(500).optional(),
        expiresInSeconds: z
            .number()
            .int()
            .min(60)
            .max(365 * 24 * 60 * 60)
            .optional(),
    }).strict(),

    z.object({
        action: z.literal("unban"),
    }).strict(),
]);

const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    banned: true,
    banReason: true,
    banExpires: true,
    updatedAt: true,
} as const;

type RouteContext = {
    params: Promise<{
        userId: string;
    }>;
};

export async function PATCH(
    request: Request,
    { params }: RouteContext,
) {
    try {
        // 1. Only a Super Admin can manage account status.
        const currentUser = await requireSuperAdmin();

        // 2. Validate the route parameter.
        const { userId } = await params;

        const parsedParams = paramsSchema.safeParse({
            userId,
        });

        if (!parsedParams.success) {
            return NextResponse.json(
                {
                    message: "Invalid user ID.",
                    errors: parsedParams.error.flatten(),
                },
                { status: 400 },
            );
        }

        // 3. Parse and validate the request body.
        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { message: "Invalid JSON request body." },
                { status: 400 },
            );
        }

        const parsedBody = bodySchema.safeParse(body);

        if (!parsedBody.success) {
            return NextResponse.json(
                {
                    message: "Invalid request body.",
                    errors: parsedBody.error.flatten(),
                },
                { status: 400 },
            );
        }

        // 4. Find the target account.
        const targetUser = await prisma.user.findUnique({
            where: {
                id: parsedParams.data.userId,
            },
            select: {
                id: true,
                role: true,
            },
        });

        if (!targetUser) {
            return NextResponse.json(
                { message: "User not found." },
                { status: 404 },
            );
        }

        // 5. Protect Super Admin accounts and prevent self-banning.
        if (
            targetUser.role === "super_admin" ||
            targetUser.id === currentUser.id
        ) {
            return NextResponse.json(
                {
                    message:
                        "You cannot change the status of this account.",
                },
                { status: 403 },
            );
        }

        // 6. Perform the operation through Better Auth.
        const sessionHeaders = await headers();

        if (parsedBody.data.action === "ban") {
            const { reason, expiresInSeconds } = parsedBody.data;

            await auth.api.banUser({
                body: {
                    userId: targetUser.id,
                    ...(reason ? { banReason: reason } : {}),
                    ...(expiresInSeconds !== undefined
                        ? { banExpiresIn: expiresInSeconds }
                        : {}),
                },
                headers: sessionHeaders,
            });
        } else {
            await auth.api.unbanUser({
                body: {
                    userId: targetUser.id,
                },
                headers: sessionHeaders,
            });
        }

        // 7. Fetch the updated account status.
        const updatedUser = await prisma.user.findUnique({
            where: {
                id: targetUser.id,
            },
            select: userSelect,
        });

        if (!updatedUser) {
            return NextResponse.json(
                { message: "User not found." },
                { status: 404 },
            );
        }

        return NextResponse.json(
            {
                message:
                    parsedBody.data.action === "ban"
                        ? "User banned successfully."
                        : "User unbanned successfully.",
                user: updatedUser,
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

        console.error("Admin user status error:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}
