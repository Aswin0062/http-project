import { connectToMongoDB } from "@/lib/db";
import User, { IUser } from "@/models/user";
import type { NextAuthOptions, Profile, Session, User as AuthUser } from "next-auth";
import credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";
import { UserRoles } from "@/dao";

export const authOptions: NextAuthOptions = {
    providers: [
        credentials({
            name: "Credentials",
            id: "credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectToMongoDB();
                const user = await User.findOne<IUser>({
                    email: credentials?.email,
                });

                if (!user) {
                    console.log(`User is not present for email: ${credentials?.email}`);
                    throw new Error("Invalid Email or Password");
                }

                const passwordMatch = await bcrypt.compare(
                    credentials!.password,
                    user.password
                );

                if (!passwordMatch) {
                    console.log(`Password mismatch for email: ${credentials?.email}`);
                    throw new Error("Invalid Email or Password");
                }
                return {id: user.id, email: user.email, name: user.email, image: null, role: user.role};
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt(params: {
            token: JWT;
            user: AuthUser | AdapterUser;
            profile?: Profile | undefined;
        }) {
            if (params.token && params.user?.id) {
                params.token.id = params.user.id;
                params.token.role = params.user.role;
            }
            return params.token;
        },
        async session(params: {session: Session, token: JWT}) {
            if (params.session && params.token?.id) {
                params.session.userId = params.token.id as string;
                params.session.role = params.token.role as UserRoles;
            }
            return params.session;
        }
    },
    pages: {
        signIn: '/'
    }
};