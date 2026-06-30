import mongoose, { Document, Schema } from "mongoose";

export interface ICampaign extends Document {
  title: string;
  description?: string;
  dimension?: string;
  camstate?: string;
  city?: string;
  camptype?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  status: "draft" | "active" | "paused" | "completed";
  ownerId: mongoose.Types.ObjectId;
  assignedClientId?: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    dimension: { type: String, default: "" },
    camstate: { type: String, default: "" },
    city: { type: String, default: "" },
    camptype: { type: String, enum: ["", "Lit", "Non Lit"], default: "" },
    location: { type: String, default: "" },
    latitude: { type: String, default: "" },
    longitude: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "active", "paused", "completed"],
      default: "draft",
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedClientId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    shareToken: { type: String, default: null, sparse: true },
  },
  { timestamps: true }
);

export const Campaign = (mongoose.models.Campaign as mongoose.Model<ICampaign>) || mongoose.model<ICampaign>("Campaign", CampaignSchema);
