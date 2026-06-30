import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  loginUser,
  registerUser,
  sendLoginOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getUserByEmail,
} from "@/actions/auth.actions";
import { signToken, verifyToken } from "@/lib/jwt";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("stlyeloft_token")?.value;
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    return await getUserByEmail(payload.email);
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action } = body as { action: string };

  try {
    switch (action) {
      case "signup": {
        const { email, name, password, role } = body;
        const user = await registerUser({
          email,
          name,
          password,
          role: role ?? "client",
        });
        return NextResponse.json({ user, message: "OTP sent to email" });
      }

      case "login": {
        const { email, password, expectedRole } = body;
        const result = await loginUser({ email, password, expectedRole });
        const response = NextResponse.json(result);
        response.cookies.set("stlyeloft_token", result.token, {
          httpOnly: true,
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
        return response;
      }

      case "send-login-otp": {
        const { email } = body;
        await sendLoginOtp(email);
        return NextResponse.json({ email, message: "OTP sent for login" });
      }

      case "verify-otp": {
        const { email, code, type } = body;
        await verifyOtp({ email, code, type });

        if (type === "login") {
          const user = await getUserByEmail(email);
          if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
          }
          const token = signToken({ id: user._id.toString(), email: user.email, role: user.role });
          const response = NextResponse.json({ token, user });
          response.cookies.set("stlyeloft_token", token, {
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
          });
          return response;
        }

        if (type === "register") {
          const user = await getUserByEmail(email);
          return NextResponse.json({ message: "OTP verified", user });
        }

        return NextResponse.json({ message: "OTP verified" });
      }

      case "forgot-password": {
        const { email } = body;
        await forgotPassword(email);
        return NextResponse.json({ email, message: "Password reset OTP sent" });
      }

      case "reset-password": {
        const { email, code, newPassword } = body;
        const result = await resetPassword({ email, code, newPassword });
        const response = NextResponse.json(result);
        response.cookies.set("stlyeloft_token", result.token, {
          httpOnly: true,
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
        return response;
      }

      case "logout": {
        const response = NextResponse.json({ message: "Logged out" });
        response.cookies.set("stlyeloft_token", "", {
          httpOnly: true,
          path: "/",
          maxAge: 0,
        });
        return response;
      }

      default:
        return NextResponse.json({ error: "Unknown auth action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
