import mongoose, { Document, Schema } from "mongoose";

export interface ICampaignImage extends Document {
  campaignId: mongoose.Types.ObjectId;
  url: string;
  publicId: string;
  altText?: string;
  dimension?: string;
  camptype?: string;
  title?: string;
  startDate?: Date;
  endDate?: Date;
  latitude?: string;
  longitude?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignImageSchema = new Schema<ICampaignImage>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    altText: { type: String, default: "" },
    dimension: { type: String, default: "" },
    camptype: { type: String, default: "" },
    title: { type: String, default: "" },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    latitude: { type: String, default: "" },
    longitude: { type: String, default: "" },
  },
  { timestamps: true }
);

export const CampaignImage = (mongoose.models.CampaignImage as mongoose.Model<ICampaignImage>) || mongoose.model<ICampaignImage>("CampaignImage", CampaignImageSchema);
