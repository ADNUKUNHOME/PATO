
import { createAccessControl } from "better-auth/plugins/access";
import {
    defaultStatements,
    adminAc,
} from "better-auth/plugins/admin/access";

const statement = {
    ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

// Normal customers cannot use administrative operations.
export const customer = ac.newRole({
    user: [],
    session: [],
});

// PATO admins cannot use Better Auth's administrative endpoints.
// Their product-management permissions will be handled separately.
export const admin = ac.newRole({
    user: [],
    session: [],
});

// Only super_admin receives Better Auth's full admin permissions.
export const superAdmin = ac.newRole({
    ...adminAc.statements,
});
