import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: typeof mongoose;
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = mongoose;
  console.log("not connet")
}

export async function connectDb() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  return mongoose.connect(MONGODB_URI);
}

