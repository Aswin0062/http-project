import { ISignUpRequest, ISignUpResponse } from "@/dao";
import { connectToMongoDB } from "@/lib/db";
import User, { IUser } from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    const { email, password } = await req.json() as ISignUpRequest;
    if (!email || email.trim().length === 0 || !password || password.trim().length === 0) {
        return Response.json({ message: "Email and Password is mandatory", result: false } as ISignUpResponse, { status: 400 });
    }
    try {
        await connectToMongoDB();
        const userFound = await User.findOne<IUser>({ "email": { $regex: new RegExp(`^${email.trim()}$`), $options: 'i' } });
        if (userFound) {
            return Response.json({ message: "Email already exists!" , result: false } as ISignUpResponse, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashedPassword,
        });
        await user.save();
        return Response.json({ message: "User Created Successfully" , result: true } as ISignUpResponse, { status: 201 });
    } catch (e) {
        console.error(`Failed to register user due to ${e}`);
        return Response.json({ message: "Please try again later" , result: false } as ISignUpResponse, {status: 500});
    }
}