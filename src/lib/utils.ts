import bcrypt from "bcryptjs";

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function generateClientNumber() {
  const randomPart = Math.floor(100 + Math.random() * 900).toString();
  return `CL${randomPart}`;
}

