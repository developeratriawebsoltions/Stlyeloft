import { NextResponse } from "next/server";
import { getUsers, getUserById, updateUser, deleteUser } from "@/actions/user.actions";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  }

  const users = await getUsers();
  return NextResponse.json(users);
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "User id is required" }, { status: 400 });
  }
  const body = await request.json();
  try {
    const updated = await updateUser(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "User id is required" }, { status: 400 });
  }

  try {
    const deleted = await deleteUser(id);
    return NextResponse.json(deleted);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
