
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
    AuthorizationError,
    requireAuthenticatedUser,
} from "@/lib/auth/guards";

// Normalize Indian mobile numbers to 10 digits.
function normalizePhone(value: string) {
    return value
        .replace(/[\s()-]/g, "")
        .replace(/^\+91/, "")
        .replace(/^0/, "");
}

const phoneSchema = z
    .string()
    .trim()
    .transform(normalizePhone)
    .pipe(
        z.string().regex(
            /^[6-9]\d{9}$/,
            "Enter a valid 10-digit Indian mobile number.",
        ),
    );

const optionalPhoneSchema = z
    .union([phoneSchema, z.literal("")])
    .optional()
    .transform((value) => (!value ? null : value));

const optionalText = (max: number) =>
    z
        .string()
        .trim()
        .max(max)
        .optional()
        .transform((value) => value || null);

const createAddressSchema = z
    .object({
        label: optionalText(30),

        fullName: z
            .string()
            .trim()
            .min(2)
            .max(100),

        phone: phoneSchema,

        alternatePhone: optionalPhoneSchema,

        addressLine1: z
            .string()
            .trim()
            .min(5)
            .max(200),

        addressLine2: optionalText(200),

        landmark: optionalText(100),

        city: z
            .string()
            .trim()
            .min(2)
            .max(100),

        state: z
            .string()
            .trim()
            .min(2)
            .max(100),

        postalCode: z
            .string()
            .trim()
            .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit Indian PIN code."),

        countryCode: z.literal("IN").default("IN"),

        isDefault: z.boolean().default(false),
    })
    .strict();

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

// GET /api/users/me/addresses
export async function GET() {
    try {
        const currentUser = await requireAuthenticatedUser();

        const addresses = await prisma.address.findMany({
            where: {
                userId: currentUser.id,
            },
            select: addressSelect,
            orderBy: [
                { isDefault: "desc" },
                { createdAt: "desc" },
            ],
        });

        return NextResponse.json({ addresses });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status },
            );
        }

        console.error("GET /api/users/me/addresses:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}

// POST /api/users/me/addresses
export async function POST(request: Request) {
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

        const validation = createAddressSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    message: "Invalid address data.",
                    errors: validation.error.flatten(),
                },
                { status: 400 },
            );
        }

        const addressData = validation.data;

        const address = await prisma.$transaction(
            async (tx) => {
                const existingCount = await tx.address.count({
                    where: {
                        userId: currentUser.id,
                    },
                });

                // The first address automatically becomes the default.
                const shouldBeDefault =
                    addressData.isDefault || existingCount === 0;

                // A user can have only one default address.
                if (shouldBeDefault) {
                    await tx.address.updateMany({
                        where: {
                            userId: currentUser.id,
                            isDefault: true,
                        },
                        data: {
                            isDefault: false,
                        },
                    });
                }

                return tx.address.create({
                    data: {
                        ...addressData,
                        isDefault: shouldBeDefault,
                        userId: currentUser.id,
                    },
                    select: addressSelect,
                });
            },
            {
                isolationLevel: "Serializable",
            },
        );

        return NextResponse.json(
            {
                message: "Address created successfully.",
                address,
            },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status },
            );
        }

        // A concurrent transaction may need to be retried.
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2034"
        ) {
            return NextResponse.json(
                {
                    message: "Address operation conflicted with another request. Please try again.",
                },
                { status: 409 },
            );
        }

        console.error("POST /api/users/me/addresses:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}