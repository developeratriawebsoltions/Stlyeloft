import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { Campaign } from "@/models/Campaign";
import { CampaignImage } from "@/models/CampaignImage";

export async function createCampaign(data: {
  title: string;
  description?: string;
  ownerId: string;
  assignedClientId?: string;
  startDate?: string;
  endDate?: string;
  dimension?: string;
  camstate?: string;
  city?: string;
  camptype?: string;
  location?: string;
}) {
  await connectDb();
  return Campaign.create({
    title: data.title,
    description: data.description ?? "",
    dimension: data.dimension || "",
    camstate: data.camstate || "",
    city: data.city || "",
    camptype: data.camptype || "",
    location: data.location || "",
    ownerId: data.ownerId,
    assignedClientId: data.assignedClientId || undefined,
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    endDate: data.endDate ? new Date(data.endDate) : undefined,
  });
}

export async function getCampaigns(query: {
  status?: string;
  ownerId?: string;
  assignedClientId?: string;
  search?: string;
}) {
  await connectDb();
  const filters: Record<string, unknown> = {};

  if (query.status) filters.status = query.status;
  if (query.ownerId) filters.ownerId = query.ownerId;
  if (query.assignedClientId) filters.assignedClientId = query.assignedClientId;
  if (query.search) {
    filters.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  return Campaign.find(filters).sort({ createdAt: -1 });
}

export async function getCampaignById(id: string) {
  await connectDb();
  return Campaign.findById(id)
    .populate("assignedClientId", "name")
    .populate("ownerId", "name");
}

export async function getCampaignCountsByClientIds(clientIds: string[]) {
  await connectDb();
  const ids = clientIds.filter(Boolean).map((id) => new mongoose.Types.ObjectId(id));
  if (ids.length === 0) {
    return {} as Record<string, number>;
  }

  const counts = await Campaign.aggregate([
    { $match: { assignedClientId: { $in: ids } } },
    { $group: { _id: "$assignedClientId", count: { $sum: 1 } } },
  ]);

  return counts.reduce<Record<string, number>>((acc, item) => {
    acc[String(item._id)] = item.count;
    return acc;
  }, {});
}

export async function getCampaignStatusCounts() {
  await connectDb();

  const counts = await Campaign.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  return counts.reduce<Record<string, number>>((acc, item) => {
    acc[String(item._id)] = item.count;
    return acc;
  }, {
    draft: 0,
    active: 0,
    completed: 0,
    paused: 0,
  });
}

export async function countCampaignImages() {
  await connectDb();
  return CampaignImage.countDocuments();
}

export async function getRecentCampaigns(limit = 5) {
  await connectDb();
  return Campaign.find()
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate("assignedClientId", "name")
    .lean();
}

export async function getCampaignsCreatedThisMonth() {
  await connectDb();
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  return Campaign.countDocuments({ createdAt: { $gte: startOfMonth } });
}

export async function updateCampaign(id: string, updates: Partial<{ title: string; description: string; status: string; assignedClientId: string; startDate: string; endDate: string }>) {
  await connectDb();
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.assignedClientId !== undefined) payload.assignedClientId = updates.assignedClientId;
  if ((updates as any).dimension !== undefined) payload.dimension = (updates as any).dimension;
  if ((updates as any).camstate !== undefined) payload.camstate = (updates as any).camstate;
  if ((updates as any).city !== undefined) payload.city = (updates as any).city;
  if ((updates as any).camptype !== undefined) payload.camptype = (updates as any).camptype;
  if ((updates as any).location !== undefined) payload.location = (updates as any).location;
  if (updates.startDate !== undefined) payload.startDate = updates.startDate ? new Date(updates.startDate) : undefined;
  if (updates.endDate !== undefined) payload.endDate = updates.endDate ? new Date(updates.endDate) : undefined;

  return Campaign.findByIdAndUpdate(id, payload, { new: true });
}

export async function deleteCampaign(id: string) {
  await connectDb();
  await Campaign.findByIdAndDelete(id);
  await CampaignImage.deleteMany({ campaignId: id });
  return { deleted: true };
}

export async function saveCampaignImage(data: {
  campaignId: string;
  url: string;
  publicId: string;
  altText?: string;
  dimension?: string;
  camptype?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  latitude?: string;
  longitude?: string;
}) {
  await connectDb();
  return CampaignImage.create({
    campaignId: data.campaignId,
    url: data.url,
    publicId: data.publicId,
    altText: data.altText || "",
    dimension: data.dimension || "",
    camptype: data.camptype || "",
    title: data.title || "",
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    latitude: data.latitude || "",
    longitude: data.longitude || "",
  });
}
