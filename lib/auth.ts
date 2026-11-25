
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin } from "better-auth/plugins";

import { prisma } from "@/lib/prisma";
import {
    ac,
    customer,
    admin,
    superAdmin,
} from "@/lib/auth/permissions";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
    },

    plugins: [
        adminPlugin({
            defaultRole: "customer",

            ac,

            roles: {
                customer,
                admin,
                super_admin: superAdmin,
            },
        }),
    ],
});
