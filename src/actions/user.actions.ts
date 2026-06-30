import { connectDb } from "@/lib/db";
import { User } from "@/models/User";

export async function getUsers() {
  await connectDb();
  return User.find()
    .select("email name role clientNumber createdAt updatedAt")
    .sort({ createdAt: -1 })
    .lean();
}

export async function getUserById(id: string) {
  await connectDb();
  return User.findById(id)
    .select("email name role clientNumber clientId createdAt updatedAt")
    .lean();
}

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
  role: "super-admin" | "admin" | "client";
}) {
  await connectDb();
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new Error("User already exists");
  }

  return User.create({
    email: data.email,
    name: data.name,
    password: data.password,
    role: data.role,
  });
}

export async function updateUser(id: string, data: { name?: string; email?: string }) {
  await connectDb();
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  if (data.email && data.email !== user.email) {
    const existingEmail = await User.findOne({ email: data.email });
    if (existingEmail) {
      throw new Error("Email is already in use");
    }
    user.email = data.email;
  }

  if (data.name) {
    user.name = data.name;
  }

  await user.save();
  return user;
}

export async function deleteUser(id: string) {
  await connectDb();
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  await user.deleteOne();
  return { success: true };
}
