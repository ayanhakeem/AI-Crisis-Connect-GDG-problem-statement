require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crisisconnect');
  console.log('✅ MongoDB Connected');
};

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'staff' },
  department: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const seed = async () => {
  await connectDB();

  const User = mongoose.models.User || mongoose.model('User', userSchema);

  const users = [
    { name: 'Hotel Manager',  email: 'admin@hotel.com',       password: 'admin123', role: 'admin', department: 'Management' },
    { name: 'Sarah Johnson',  email: 'staff@hotel.com',       password: 'staff123', role: 'staff', department: 'Front Desk' },
    { name: 'Mike Chen',      email: 'security@hotel.com',    password: 'staff123', role: 'staff', department: 'Security' },
    { name: 'Dr. Priya Patel',email: 'medical@hotel.com',     password: 'staff123', role: 'staff', department: 'Medical' },
    { name: 'Ramesh Kumar',   email: 'maintenance@hotel.com', password: 'staff123', role: 'staff', department: 'Maintenance' },
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`⚠️  Skip (exists): ${u.email}`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hashed });
    console.log(`✅ Created: ${u.name} (${u.role}) — ${u.email}`);
  }

  console.log('\n🎉 Seed complete!');
  console.log('   Admin:       admin@hotel.com    / admin123');
  console.log('   Staff:       staff@hotel.com    / staff123');
  console.log('   Security:    security@hotel.com / staff123');
  console.log('   Medical:     medical@hotel.com  / staff123');
  console.log('   Maintenance: maintenance@hotel.com / staff123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
