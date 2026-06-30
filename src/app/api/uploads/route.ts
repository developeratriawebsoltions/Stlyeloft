import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { saveCampaignImage } from "@/actions/campaign.actions";
import { connectDb } from "@/lib/db";
import { CampaignImage } from "@/models/CampaignImage";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const campaignId = url.searchParams.get("campaignId");
  if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });
  await connectDb();
  const images = await CampaignImage.find({ campaignId }).sort({ createdAt: -1 });
  return NextResponse.json(images);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const campaignId = formData.get("campaignId") as string | null;
    const title = (formData.get("title") as string) ?? "";
    const camptype = (formData.get("camptype") as string) ?? "";
    const dimension = (formData.get("dimension") as string) ?? "";
    const startDate = (formData.get("startDate") as string) ?? "";
    const endDate = (formData.get("endDate") as string) ?? "";
    const latitude = (formData.get("latitude") as string) ?? "";
    const longitude = (formData.get("longitude") as string) ?? "";

    if (!file || !campaignId) {
      return NextResponse.json({ error: "file and campaignId are required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `stlyeloft/campaigns/${campaignId}` },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error("Upload failed"));
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        }
      ).end(buffer);
    });

    const image = await saveCampaignImage({
      campaignId,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      title,
      camptype,
      dimension,
      startDate,
      endDate,
      latitude,
      longitude,
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
