#!/usr/bin/env node
// Usage: node scripts/updateEmail.js oldEmail newEmail

const mongoose = require('mongoose');

const [,, oldEmail, newEmail] = process.argv;
if (!oldEmail || !newEmail) {
  console.error('Usage: node scripts/updateEmail.js oldEmail newEmail');
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

  try {
    const updated = await User.findOneAndUpdate(
      { email: oldEmail },
      { $set: { email: newEmail } },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updated) {
      console.error('No user found with email:', oldEmail);
      await mongoose.disconnect();
      process.exit(2);
    }

    console.log('Email updated successfully:');
    console.log('  old:', oldEmail);
    console.log('  new:', updated.email);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error updating email:', err.message || err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
