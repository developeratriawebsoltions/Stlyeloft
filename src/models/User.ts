import mongoose, { Document, Schema } from "mongoose";
import { generateClientNumber } from "@/lib/utils";

export interface IUser extends Document {
  email: string;
  password: string;
  role: "super-admin" | "admin" | "client";
  name: string;
  clientNumber?: string;
  isVerified: boolean;
  clientId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["super-admin", "admin", "client"], default: "client" },
    name: { type: String, required: true, trim: true },
    clientNumber: { type: String, required: false, unique: true, sparse: true, trim: true },
    isVerified: { type: Boolean, default: false },
    clientId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

UserSchema.index({ clientNumber: 1 }, { unique: true, sparse: true });

UserSchema.pre("save", async function () {
  try {
    console.log(`[User.pre-save] Processing user: role=${this.role}, hasClientNumber=${!!this.clientNumber}`);
    
    if (this.role === "client" && !this.clientNumber) {
      console.log("[User.pre-save] Generating client number...");
      let attempts = 0;
      while (attempts < 100) {
        const generated = generateClientNumber();
        console.log(`[User.pre-save] Attempt ${attempts + 1}: Generated ${generated}`);
        
        const existing = await this.model("User").findOne({ clientNumber: generated });
        if (!existing) {
          this.clientNumber = generated;
          console.log(`[User.pre-save] ✅ Assigned client number: ${generated}`);
          break;
        }
        attempts += 1;
      }
      if (!this.clientNumber) {
        throw new Error("Unable to generate a unique client number after 100 attempts");
      }
    }
  } catch (error) {
    console.error("[User.pre-save] ❌ Error:", error);
    throw error;
  }
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
