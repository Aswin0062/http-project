import { UserRoles } from "@/dao";
import NextAuth, { DefaultSession, JWT } from "next-auth"
declare module "next-auth" {

    // Extend session to hold the access_token
    interface DefaultSession {
        userId?: string;
        role?: UserRoles;
    }

    interface DefaultUser {
        role?: UserRoles;
    }
}