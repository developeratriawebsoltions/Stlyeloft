import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { Otp } from "@/models/Otp";
import { hashPassword, comparePassword, generateOtp } from "@/lib/utils";
import { sendOtpEmail } from "@/lib/mailer";
import { signToken } from "@/lib/jwt";

export async function registerUser({
  email,
  name,
  password,
  role,
}: {
  email: string;
  name: string;
  password: string;
  role: "super-admin" | "admin" | "client";
}) {
  await connectDb();
  const existing = await User.findOne({ email });

  if (existing) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    email,
    name,
    password: hashedPassword,
    role,
    isVerified: role === "super-admin",
  });

  if (role === "super-admin") {
    return user;
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.create({ email, code, type: "register", expiresAt });
  await sendOtpEmail(email, code);

  return user;
}

export async function verifyOtp({
  email,
  code,
  type,
}: {
  email: string;
  code: string;
  type: "register" | "login" | "forgot-password" | "reset-password";
}) {
  await connectDb();
  const otp = await Otp.findOne({ email, code, type });

  if (!otp || otp.expiresAt < new Date()) {
    throw new Error("Invalid or expired OTP code");
  }

  if (type !== "forgot-password") {
    await Otp.deleteMany({ email, type });
  }

  if (type === "register") {
    await User.updateOne({ email }, { isVerified: true });
  }

  return true;
}

export async function loginUser({
  email,
  password,
  expectedRole,
}: {
  email: string;
  password: string;
  expectedRole?: "super-admin" | "admin" | "client";
}) {
  await connectDb();
  const user = await User.findOne({ email });

  if (!user) throw new Error("Invalid credentials");

  if (expectedRole && user.role !== expectedRole) {
    throw new Error(`Invalid role. Expected ${expectedRole}, got ${user.role}`);
  }

  // If user was created before isVerified field existed, auto-upgrade to verified
  if (user.isVerified === undefined || user.isVerified === null) {
    await User.updateOne({ _id: user._id }, { isVerified: true });
    user.isVerified = true;
  }

  if (!user.isVerified) {
    throw new Error("Account not verified. Please verify OTP first");
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const token = signToken({ id: user._id.toString(), email: user.email, role: user.role });
  return {
    token,
    user: {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function sendLoginOtp(email: string) {
  await connectDb();
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  if (!user.isVerified) throw new Error("Account not verified. Please verify your OTP first.");

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await Otp.create({ email, code, type: "login", expiresAt });
  await sendOtpEmail(email, code);
  return { email };
}

export async function forgotPassword(email: string) {
  await connectDb();
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await Otp.create({ email, code, type: "forgot-password", expiresAt });
  await sendOtpEmail(email, code);
  return { email };
}

export async function resetPassword({
  email,
  code,
  newPassword,
}: {
  email: string;
  code: string;
  newPassword: string;
}) {
  await connectDb();
  const otp = await Otp.findOne({ email, code, type: "forgot-password" });

  if (!otp || otp.expiresAt < new Date()) {
    throw new Error("Invalid or expired OTP code");
  }

  const hashedPassword = await hashPassword(newPassword);
  await User.updateOne({ email }, { password: hashedPassword });
  await Otp.deleteMany({ email, type: "forgot-password" });

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found after password reset");
  }

  const token = signToken({ id: user._id.toString(), email: user.email, role: user.role });
  return { token, user };
}

export async function getUserByEmail(email: string) {
  await connectDb();
  return User.findOne({ email }).select("_id email name role isVerified").lean();
}
