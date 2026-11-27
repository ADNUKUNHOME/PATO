
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
    AuthorizationError,
    requireSuperAdmin,
} from "@/lib/auth/guards";

const paramsSchema = z.object({
    userId: z.string().trim().min(1).max(100),
});

const bodySchema = z.object({
    role: z.enum(["customer", "admin"]),
}).strict();

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
        // 1. Only Super Admins can change user roles.
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

        const targetUserId = parsedParams.data.userId;
        const newRole = parsedBody.data.role;

        // 4. Prevent changing your own role.
        if (targetUserId === currentUser.id) {
            return NextResponse.json(
                {
                    message: "You cannot change your own role.",
                },
                { status: 403 },
            );
        }

        // 5. Update the role and revoke sessions atomically.
        const result = await prisma.$transaction(async (tx) => {
            const targetUser = await tx.user.findUnique({
                where: {
                    id: targetUserId,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });

            if (!targetUser) {
                return {
                    status: "not_found" as const,
                };
            }

            // Never allow this endpoint to modify Super Admin accounts.
            if (targetUser.role === "super_admin") {
                return {
                    status: "protected" as const,
                };
            }

            // Avoid unnecessary session revocation if the role is unchanged.
            if (targetUser.role === newRole) {
                return {
                    status: "unchanged" as const,
                    user: targetUser,
                };
            }

            // Update only accounts with an eligible current role.
            const updated = await tx.user.updateMany({
                where: {
                    id: targetUserId,
                    role: {
                        in: ["customer", "admin"],
                    },
                },
                data: {
                    role: newRole,
                },
            });

            if (updated.count !== 1) {
                return {
                    status: "conflict" as const,
                };
            }

            // Revoke all existing sessions after the role change.
            await tx.session.deleteMany({
                where: {
                    userId: targetUserId,
                },
            });

            const updatedUser = await tx.user.findUnique({
                where: {
                    id: targetUserId,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    updatedAt: true,
                },
            });

            if (!updatedUser) {
                throw new Error(
                    "Updated user could not be retrieved.",
                );
            }

            return {
                status: "updated" as const,
                user: updatedUser,
            };
        });

        // 6. Return the appropriate response.
        if (result.status === "not_found") {
            return NextResponse.json(
                { message: "User not found." },
                { status: 404 },
            );
        }

        if (result.status === "protected") {
            return NextResponse.json(
                {
                    message:
                        "Super Admin roles cannot be changed through this endpoint.",
                },
                { status: 403 },
            );
        }

        if (result.status === "conflict") {
            return NextResponse.json(
                {
                    message:
                        "The user's role changed during this request. Please try again.",
                },
                { status: 409 },
            );
        }

        if (result.status === "unchanged") {
            return NextResponse.json(
                {
                    message: "The user already has this role.",
                    user: result.user,
                },
                {
                    status: 200,
                    headers: {
                        "Cache-Control": "no-store",
                    },
                },
            );
        }

        return NextResponse.json(
            {
                message: "User role updated successfully.",
                user: result.user,
                sessionsRevoked: true,
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

        console.error("Admin user role error:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}
