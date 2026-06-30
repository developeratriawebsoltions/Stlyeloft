import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "stlyeloft_secret";

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

export function signToken(payload: {
  id: string;
  email: string;
  role: string;
}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
}

