
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
    AuthorizationError,
    requireAuthenticatedUser,
} from "@/lib/auth/guards";

type RouteContext = {
    params: Promise<{ addressId: string }>;
};

const addressIdSchema = z.string().min(1).max(100);

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

const optionalText = (max: number) =>
    z
        .string()
        .trim()
        .max(max)
        .transform((value) => value || null)
        .optional();

const updateAddressSchema = z
    .object({
        label: optionalText(30),

        fullName: z
            .string()
            .trim()
            .min(2)
            .max(100)
            .optional(),

        phone: phoneSchema.optional(),

        alternatePhone: z
            .union([
                phoneSchema,
                z.literal("").transform(() => null),
                z.null(),
            ])
            .optional(),

        addressLine1: z
            .string()
            .trim()
            .min(5)
            .max(200)
            .optional(),

        addressLine2: optionalText(200),

        landmark: optionalText(100),

        city: z
            .string()
            .trim()
            .min(2)
            .max(100)
            .optional(),

        state: z
            .string()
            .trim()
            .min(2)
            .max(100)
            .optional(),

        postalCode: z
            .string()
            .trim()
            .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit Indian PIN code.")
            .optional(),

        countryCode: z.literal("IN").optional(),

        isDefault: z.boolean().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "Provide at least one field to update.",
    });

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

function isTransactionConflict(error: unknown) {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2034"
    );
}

// PATCH /api/users/me/addresses/[addressId]
export async function PATCH(
    request: Request,
    { params }: RouteContext,
) {
    try {
        const currentUser = await requireAuthenticatedUser();

        const { addressId } = await params;

        if (!addressIdSchema.safeParse(addressId).success) {
            return NextResponse.json(
                { message: "Invalid address ID." },
                { status: 400 },
            );
        }

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { message: "Invalid JSON body." },
                { status: 400 },
            );
        }

        const validation = updateAddressSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    message: "Invalid address data.",
                    errors: validation.error.flatten(),
                },
                { status: 400 },
            );
        }

        const address = await prisma.$transaction(
            async (tx) => {
                // Ownership check: only the current user's address is accessible.
                const existingAddress = await tx.address.findFirst({
                    where: {
                        id: addressId,
                        userId: currentUser.id,
                    },
                });

                if (!existingAddress) {
                    return null;
                }

                const updateData = validation.data;

                if (updateData.isDefault === true) {
                    // Clear the previous default address.
                    await tx.address.updateMany({
                        where: {
                            userId: currentUser.id,
                            id: { not: addressId },
                            isDefault: true,
                        },
                        data: {
                            isDefault: false,
                        },
                    });
                }

                if (
                    updateData.isDefault === false &&
                    existingAddress.isDefault
                ) {
                    // Find a replacement default address.
                    const replacement = await tx.address.findFirst({
                        where: {
                            userId: currentUser.id,
                            id: { not: addressId },
                        },
                        orderBy: {
                            createdAt: "asc",
                        },
                    });

                    if (replacement) {
                        await tx.address.update({
                            where: { id: replacement.id },
                            data: { isDefault: true },
                        });
                    } else {
                        // Keep the only address as default.
                        updateData.isDefault = true;
                    }
                }

                return tx.address.update({
                    where: {
                        id: addressId,
                    },
                    data: updateData,
                    select: addressSelect,
                });
            },
            {
                isolationLevel: "Serializable",
            },
        );

        if (!address) {
            return NextResponse.json(
                { message: "Address not found." },
                { status: 404 },
            );
        }

        return NextResponse.json({
            message: "Address updated successfully.",
            address,
        });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status },
            );
        }

        if (isTransactionConflict(error)) {
            return NextResponse.json(
                { message: "Address operation conflicted with another request. Please try again." },
                { status: 409 },
            );
        }

        console.error("PATCH /api/users/me/addresses/[addressId]:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}

// DELETE /api/users/me/addresses/[addressId]
export async function DELETE(
    _request: Request,
    { params }: RouteContext,
) {
    try {
        const currentUser = await requireAuthenticatedUser();

        const { addressId } = await params;

        if (!addressIdSchema.safeParse(addressId).success) {
            return NextResponse.json(
                { message: "Invalid address ID." },
                { status: 400 },
            );
        }

        const result = await prisma.$transaction(
            async (tx) => {
                // Ownership check.
                const existingAddress = await tx.address.findFirst({
                    where: {
                        id: addressId,
                        userId: currentUser.id,
                    },
                });

                if (!existingAddress) {
                    return null;
                }

                await tx.address.deleteMany({
                    where: {
                        id: addressId,
                        userId: currentUser.id,
                    },
                });

                let promotedAddressId: string | null = null;

                if (existingAddress.isDefault) {
                    // Promote the oldest remaining address.
                    const replacement = await tx.address.findFirst({
                        where: {
                            userId: currentUser.id,
                        },
                        orderBy: {
                            createdAt: "asc",
                        },
                    });

                    if (replacement) {
                        await tx.address.update({
                            where: {
                                id: replacement.id,
                            },
                            data: {
                                isDefault: true,
                            },
                        });

                        promotedAddressId = replacement.id;
                    }
                }

                return {
                    deletedAddressId: existingAddress.id,
                    promotedAddressId,
                };
            },
            {
                isolationLevel: "Serializable",
            },
        );

        if (!result) {
            return NextResponse.json(
                { message: "Address not found." },
                { status: 404 },
            );
        }

        return NextResponse.json({
            message: "Address deleted successfully.",
            ...result,
        });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status },
            );
        }

        if (isTransactionConflict(error)) {
            return NextResponse.json(
                { message: "Address operation conflicted with another request. Please try again." },
                { status: 409 },
            );
        }

        console.error("DELETE /api/users/me/addresses/[addressId]:", error);

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}