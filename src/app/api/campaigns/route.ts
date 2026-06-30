import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { createCampaign, getCampaigns, getCampaignById, updateCampaign, deleteCampaign } from "@/actions/campaign.actions";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "stlyeloft_secret");

async function getLoggedInUserId(): Promise<string | null> {
  try {
    const token = (await cookies()).get("stlyeloft_token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return (payload as { id: string }).id ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const status = url.searchParams.get("status") ?? undefined;
  const ownerId = url.searchParams.get("ownerId") ?? undefined;
  const assignedClientId = url.searchParams.get("assignedClientId") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;

  if (id) {
    const campaign = await getCampaignById(id);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    return NextResponse.json(campaign);
  }

  const campaigns = await getCampaigns({ status, ownerId, assignedClientId, search });
  return NextResponse.json(campaigns);
}

export async function POST(request: Request) {
  const ownerId = await getLoggedInUserId();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  try {
    const campaign = await createCampaign({ ...body, ownerId });
    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Campaign id is required" }, { status: 400 });
  }
  const body = await request.json();
  const campaign = await updateCampaign(id, body);
  return NextResponse.json(campaign);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Campaign id is required" }, { status: 400 });
  }
  const result = await deleteCampaign(id);
  return NextResponse.json(result);
}
