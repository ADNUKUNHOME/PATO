
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

import {
    requireAdmin,
    AuthorizationError,
} from "@/lib/auth/guards";

import { createProductImageSchema } from "@/lib/validations/product";

import { Prisma } from "@/app/generated/prisma/client";

type RouteContext = {
    params: Promise<{
        productId: string;
    }>;
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_FORMATS = [
    "jpg",
    "jpeg",
    "png",
    "webp",
];


function isCloudinaryNotFoundError(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "http_code" in error &&
        error.http_code === 404
    );
}

export async function POST(
    request: Request,
    { params }: RouteContext,
) {
    try {
        // 1. Authenticate and authorize the admin.
        await requireAdmin();

        // 2. Retrieve the product ID.
        const { productId } = await params;

        if (!productId?.trim()) {
            return NextResponse.json(
                { message: "Invalid product ID." },
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

        const validation = createProductImageSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    message: "Validation failed.",
                    errors: validation.error.flatten(),
                },
                { status: 400 },
            );
        }

        const {
            publicId,
            variantId,
            altText,
            sortOrder,
            isPrimary,
        } = validation.data;

        // 4. Verify that the product exists.
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true },
        });

        if (!product) {
            return NextResponse.json(
                { message: "Product not found." },
                { status: 404 },
            );
        }

        // 5. Verify the variant belongs to this product.
        if (variantId) {
            const variant = await prisma.productVariant.findFirst({
                where: {
                    id: variantId,
                    productId,
                },
                select: { id: true },
            });

            if (!variant) {
                return NextResponse.json(
                    {
                        message:
                            "The specified variant does not belong to this product.",
                    },
                    { status: 400 },
                );
            }
        }

        // 6. Verify the asset directly with Cloudinary.
        let asset: Awaited<
            ReturnType<typeof cloudinary.api.resource>
        >;

        try {
            asset = await cloudinary.api.resource(publicId, {
                resource_type: "image",
                type: "upload",
            });
        } catch (error) {
            if (isCloudinaryNotFoundError(error)) {
                return NextResponse.json(
                    {
                        message:
                            "The specified image could not be found in Cloudinary.",
                    },
                    { status: 404 },
                );
            }

            throw error;
        }

        // 7. Verify the asset's actual storage location.
        if (asset.public_id !== publicId) {
            return NextResponse.json(
                { message: "Cloudinary asset verification failed." },
                { status: 400 },
            );
        }

        if (asset.asset_folder !== "pato/products") {
            return NextResponse.json(
                { message: "Image is not stored in the permitted folder." },
                { status: 400 },
            );
        }

        // 8. Validate the actual uploaded image format and size.
        if (!ALLOWED_IMAGE_FORMATS.includes(asset.format)) {
            return NextResponse.json(
                {
                    message:
                        "Unsupported image format. Allowed formats: JPG, JPEG, PNG and WebP.",
                },
                { status: 400 },
            );
        }

        if (asset.bytes > MAX_IMAGE_SIZE) {
            return NextResponse.json(
                { message: "Image size must not exceed 10 MB." },
                { status: 400 },
            );
        }

        if (!asset.secure_url) {
            return NextResponse.json(
                { message: "A secure image URL could not be retrieved." },
                { status: 400 },
            );
        }

        // 9. Register the image in PostgreSQL.
        const image = await prisma.$transaction(async (tx) => {
            const existingImages = await tx.productImage.findMany({
                where: {
                    productId,
                    variantId: variantId ?? null,
                },
                select: {
                    id: true,
                    isPrimary: true,
                },
            });

            // Prevent registering the same Cloudinary asset twice
            // within the same product/variant scope.
            const duplicate = await tx.productImage.findFirst({
                where: {
                    productId,
                    variantId: variantId ?? null,
                    storageKey: publicId,
                },
                select: { id: true },
            });

            if (duplicate) {
                throw new Error("IMAGE_ALREADY_REGISTERED");
            }

            const shouldBePrimary =
                isPrimary === true ||
                existingImages.length === 0;

            // Ensure only one primary image exists in this scope.
            if (shouldBePrimary) {
                await tx.productImage.updateMany({
                    where: {
                        productId,
                        variantId: variantId ?? null,
                        isPrimary: true,
                    },
                    data: {
                        isPrimary: false,
                    },
                });
            }

            return tx.productImage.create({
                data: {
                    productId,
                    variantId: variantId ?? null,
                    url: asset.secure_url,
                    storageKey: publicId,
                    altText: altText ?? null,
                    sortOrder:
                        sortOrder ?? existingImages.length,
                    isPrimary: shouldBePrimary,
                },
            });
        });

        return NextResponse.json(
            {
                message: "Product image registered successfully.",
                image,
            },
            { status: 201 },
        );
    } catch (error) {
        // Authentication and authorization errors.
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status },
            );
        }

        if (error instanceof Error) {
            if (error.message === "IMAGE_ALREADY_REGISTERED") {
                return NextResponse.json(
                    {
                        message:
                            "This image is already registered for this product and variant.",
                    },
                    { status: 409 },
                );
            }
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                {
                    message:
                        "The image registration conflicts with an existing image or primary-image constraint.",
                },
                { status: 409 },
            );
        }

        console.error(
            "POST /api/admin/products/[productId]/images error:",
            error,
        );

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 },
        );
    }
}
