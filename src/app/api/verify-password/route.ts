import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { comparePassword } from "@/lib/utils";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "stlyeloft_secret");

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });

    const token = (await cookies()).get("stlyeloft_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    const userId = (payload as { id: string }).id;

    await connectDb();
    const user = await User.findById(userId).select("password");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const valid = await comparePassword(password, user.password);
    if (!valid) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

    return NextResponse.json({ verified: true });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
