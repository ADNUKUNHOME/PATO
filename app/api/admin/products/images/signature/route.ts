
import { NextResponse } from "next/server";

import { cloudinary } from "@/lib/cloudinary";

import {
    requireAdmin,
    AuthorizationError,
} from "@/lib/auth/guards";

export async function POST() {
    try {
        // 1. Authenticate and authorize the admin.
        await requireAdmin();

        // 2. Generate the upload timestamp.
        const timestamp = Math.floor(Date.now() / 1000);

        // 3. Define the upload parameters.
        const paramsToSign = {
            timestamp,
            folder: "pato/products",
        };

        // 4. Generate a secure Cloudinary signature.
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET!,
        );

        // 5. Return the upload details.
        return NextResponse.json({
            message: "Upload signature generated successfully.",
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder: paramsToSign.folder,
        });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status },
            );
        }

        console.error("Cloudinary signature generation error:", error);

        return NextResponse.json(
            {
                message: "An unexpected error occurred while generating the upload signature.",
            },
            { status: 500 },
        );
    }
}
