const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const User = require('../models/User');

async function main() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const targets = ['alice@example.com', 'bob@example.com', 'charlie@example.com'];
    const users = await User.find({ email: { $in: targets } });
    if (users.length === 0) {
      console.log('No sample users found. Exiting.');
      process.exit(0);
    }

    for (const user of users) {
      user.password = 'password123'; // pre-save hook will hash it
      await user.save();
      console.log(`Reset password for ${user.email}`);
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();


