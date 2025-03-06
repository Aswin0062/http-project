import { UserRoles } from "@/dao";
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRoles;
}


const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String, required: [true, "Email is required"], unique: [true, "Email already exists"], match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email is invalid",
      ],
    },
    password: { type: String, required: [true, "Password is required"] },
    role: {type: String, required: [true, "Role is required"], default: UserRoles.USER}
  },
  { timestamps: true }
);

const UserModel = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;