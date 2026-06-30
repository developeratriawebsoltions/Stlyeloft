import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Campaign } from "@/models/Campaign";

function escapeCsv(value: unknown) {
  if (value === undefined || value === null) return "";
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPersonName(entity: unknown) {
  if (!entity) return "";
  if (typeof entity === "string") return entity;
  if (typeof entity === "object") {
    const record = entity as { name?: string; email?: string; _id?: unknown };
    return record.name || record.email || String(record._id ?? "");
  }
  return String(entity);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;
  const ownerId = url.searchParams.get("ownerId") ?? undefined;
  const assignedClientId = url.searchParams.get("assignedClientId") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;

  await connectDb();
  const filters: Record<string, unknown> = {};
  if (status) filters.status = status;
  if (ownerId) filters.ownerId = ownerId;
  if (assignedClientId) filters.assignedClientId = assignedClientId;
  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const campaigns = await Campaign.find(filters)
    .sort({ createdAt: -1 })
    .populate("ownerId assignedClientId", "name email");

  const header = [
    "Title",
    "Description",
    "Status",
    "Owner",
    "Assigned Client",
    "Start Date",
    "End Date",
    "Created At",
  ];

  const rows = campaigns.map((campaign) => [
    campaign.title,
    campaign.description || "",
    campaign.status,
    getPersonName(campaign.ownerId),
    getPersonName(campaign.assignedClientId),
    formatDate(campaign.startDate),
    formatDate(campaign.endDate),
    formatDate(campaign.createdAt),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=campaigns.csv",
    },
  });
}
