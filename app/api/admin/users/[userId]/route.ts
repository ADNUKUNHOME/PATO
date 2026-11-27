
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
    AuthorizationError,
    requireAdmin,
} from "@/lib/auth/guards";

const paramsSchema = z.object({
    userId: z.string().trim().min(1).max(100),
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

const addressSelect = {
    id: true,
    label: true,
    fullName: true,
    phone: true,
    alternatePhone: true,
    addressLine1: true,
    addressLine2: true,
    landmark: true,
    city: true,
    state: true,
    postalCode: true,
    countryCode: true,
    isDefault: true,
    createdAt: true,
    updatedAt: true,
} as const;

type RouteContext = {
    params: Promise<{
        userId: string;
    }>;
};

export async function GET(
    request: Request,
    { params }: RouteContext,
) {
    try {
        // 1. Authenticate and authorize the requester.
        const currentUser = await requireAdmin();

        // 2. Validate the dynamic route parameter.
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

        // 3. Admins can view customers only.
        // Super admins can view every account.
        const where = {
            id: parsedParams.data.userId,
            ...(currentUser.role === "admin"
                ? { role: "customer" }
                : {}),
        };

        // 4. Only super admins can retrieve saved addresses.
        const select = {
            ...userSelect,
            ...(currentUser.role === "super_admin"
                ? {
                    addresses: {
                        select: addressSelect,
                        orderBy: [
                            { isDefault: "desc" as const },
                            { createdAt: "desc" as const },
                        ],
                    },
                }
                : {}),
        };

        // 5. Retrieve the user within the requester's permission scope.
        const user = await prisma.user.findFirst({
            where,
            select,
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found." },
                { status: 404 },
            );
        }

        return NextResponse.json(
            {
                user,
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

        console.error("Admin user detail error:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}
