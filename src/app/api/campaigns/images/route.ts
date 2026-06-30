import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { CampaignImage } from "@/models/CampaignImage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");
  if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });

  await connectDb();
  const images = await CampaignImage.find({ campaignId }).sort({ createdAt: -1 });
  return NextResponse.json(images);
}
