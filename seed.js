/**
 * Seed script — creates demo admin + staff accounts
 * Run once: node server/seed.js
 */
require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crisisconnect');
  console.log('✅ MongoDB Connected');
};

const seed = async () => {
  await connectDB();

  // Dynamic import of model after connection
  const User = require('./server/models/User.model');

  const users = [
    {
      name: 'Hotel Manager',
      email: 'admin@hotel.com',
      password: 'admin123',
      role: 'admin',
      department: 'Management',
    },
    {
      name: 'Sarah Johnson',
      email: 'staff@hotel.com',
      password: 'staff123',
      role: 'staff',
      department: 'Front Desk',
    },
    {
      name: 'Mike Chen',
      email: 'security@hotel.com',
      password: 'staff123',
      role: 'staff',
      department: 'Security',
    },
    {
      name: 'Dr. Priya Patel',
      email: 'medical@hotel.com',
      password: 'staff123',
      role: 'staff',
      department: 'Medical',
    },
    {
      name: 'Ramesh Kumar',
      email: 'maintenance@hotel.com',
      password: 'staff123',
      role: 'staff',
      department: 'Maintenance',
    },
  ];

  for (const userData of users) {
    const exists = await User.findOne({ email: userData.email });
    if (exists) {
      console.log(`⚠️  User ${userData.email} already exists, skipping...`);
      continue;
    }
    await User.create(userData);
    console.log(`✅ Created: ${userData.name} (${userData.role}) — ${userData.email}`);
  }

  console.log('\n🎉 Seed complete! Demo credentials:');
  console.log('   Admin:    admin@hotel.com / admin123');
  console.log('   Staff:    staff@hotel.com / staff123');
  console.log('   Security: security@hotel.com / staff123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
