
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export const ROLES = [
    "customer",
    "admin",
    "super_admin",
] as const;

export type UserRole = (typeof ROLES)[number];

function isUserRole(role: unknown): role is UserRole {
    return (
        typeof role === "string" &&
        ROLES.includes(role as UserRole)
    );
}

export class AuthorizationError extends Error {
    constructor(
        public status: 401 | 403,
        message: string,
    ) {
        super(message);
        this.name = "AuthorizationError";
    }
}

export async function getCurrentUser() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return null;
    }

    const role: unknown = session.user.role;

    // Fail closed if the database contains an unexpected role.
    if (!isUserRole(role)) {
        throw new AuthorizationError(
            403,
            "Invalid user role.",
        );
    }

    return {
        ...session.user,
        role,
    };
}

export async function requireAuthenticatedUser() {
    const user = await getCurrentUser();

    if (!user) {
        throw new AuthorizationError(
            401,
            "Authentication required.",
        );
    }

    return user;
}

export async function requireRole(
    allowedRoles: readonly UserRole[],
) {
    const user = await requireAuthenticatedUser();

    if (!allowedRoles.some((role) => role === user.role)) {
        throw new AuthorizationError(
            403,
            "You do not have permission to perform this action.",
        );
    }

    return user;
}

export async function requireAdmin() {
    return requireRole(["admin", "super_admin"]);
}

export async function requireSuperAdmin() {
    return requireRole(["super_admin"]);
}
