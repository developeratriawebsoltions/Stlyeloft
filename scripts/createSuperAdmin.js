#!/usr/bin/env node
// Usage: node scripts/createSuperAdmin.js email "Full Name" password

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const [,, email, name, password] = process.argv;

if (!email || !name || !password) {
  console.error('Usage: node scripts/createSuperAdmin.js email "Full Name" password');
  process.exit(1);
}

const MONGO = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stlyeloft';

async function main() {
  await mongoose.connect(MONGO);

  const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['super-admin','admin','client'], default: 'client' },
    name: { type: String, required: true, trim: true },
    isVerified: { type: Boolean, default: false },
  }, { timestamps: true });

  const User = mongoose.models.User || mongoose.model('User', userSchema);

  const hashed = await bcrypt.hash(password, 10);

  const result = await User.findOneAndUpdate(
    { email },
    { email, name, password: hashed, role: 'super-admin', isVerified: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('Super-admin created/updated:');
  console.log('  email:', result.email);
  console.log('  name :', result.name);
  console.log('  role :', result.role);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
