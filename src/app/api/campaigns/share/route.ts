import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Campaign } from "@/models/Campaign";
import { randomBytes } from "crypto";

// POST /api/campaigns/share  { campaignId }
// Generates (or returns existing) shareToken for a campaign
export async function POST(request: Request) {
  try {
    const { campaignId } = await request.json();
    if (!campaignId) {
      return NextResponse.json({ error: "campaignId required" }, { status: 400 });
    }

    await connectDb();
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Reuse existing token or generate new one
    if (!campaign.shareToken) {
      campaign.shareToken = randomBytes(24).toString("hex");
      await campaign.save();
    }

    return NextResponse.json({ shareToken: campaign.shareToken });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// GET /api/campaigns/share?token=xxx  — public, no auth required
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  await connectDb();
  const campaign = await Campaign.findOne({ shareToken: token })
    .populate("assignedClientId", "name")
    .lean();

  if (!campaign) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
  }

  return NextResponse.json(campaign);
}
