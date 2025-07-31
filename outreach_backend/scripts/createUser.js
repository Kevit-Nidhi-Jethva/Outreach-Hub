require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');


async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URL);
  const email = 'admin@example.com';
  const password = 'admin123'; // set your password here
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const admin = new User({
    name: 'Admin',
    email,
    password: hashedPassword,
    isAdmin: true,
    workspaces: [],
  });

  await admin.save();
  console.log('Admin created:', email, 'Password:', password);
  process.exit(0);
}

createAdmin();