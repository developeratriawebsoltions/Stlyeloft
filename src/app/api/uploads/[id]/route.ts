import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { connectDb } from "@/lib/db";
import { CampaignImage } from "@/models/CampaignImage";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDb();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  const existing = await CampaignImage.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const update: Record<string, unknown> = {};

  const title = formData.get("title") as string | null;
  const camptype = formData.get("camptype") as string | null;
  const dimension = formData.get("dimension") as string | null;
  const startDate = formData.get("startDate") as string | null;
  const endDate = formData.get("endDate") as string | null;

  if (title !== null) update.title = title;
  if (camptype !== null) update.camptype = camptype;
  if (dimension !== null) update.dimension = dimension;
  if (startDate !== null) update.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== null) update.endDate = endDate ? new Date(endDate) : null;

  if (file) {
    if (existing.publicId) await cloudinary.uploader.destroy(existing.publicId);
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `stlyeloft/campaigns/${existing.campaignId}` },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error("Upload failed"));
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        }
      ).end(buffer);
    });
    update.url = uploaded.secure_url;
    update.publicId = uploaded.public_id;
  }

  const updated = await CampaignImage.findByIdAndUpdate(id, update, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDb();

  const image = await CampaignImage.findById(id);
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (image.publicId) await cloudinary.uploader.destroy(image.publicId);
  await CampaignImage.findByIdAndDelete(id);

  return NextResponse.json({ deleted: true });
}
