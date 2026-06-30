import mongoose, { Document, Schema } from "mongoose";

export interface IOtp extends Document {
  email: string;
  code: string;
  type: "register" | "login" | "forgot-password" | "reset-password";
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    code: { type: String, required: true },
    type: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Otp = mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
