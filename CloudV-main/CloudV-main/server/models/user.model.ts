import mongoose, { Document, Model } from "mongoose";

export interface IUser {
    fullname:string;
    email:string;
    password:string;
}

export interface IUserDocument extends IUser, Document {
    createdAt:Date;
    updatedAt:Date;
}

const userSchema = new mongoose.Schema<IUserDocument>({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    
},{timestamps:true});

export const User : Model<IUserDocument> = mongoose.model<IUserDocument>("User", userSchema);