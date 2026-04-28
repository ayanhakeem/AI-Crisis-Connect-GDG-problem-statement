require('dotenv').config();
const mongoose = require('mongoose');

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.connection.collection('users');
  const user = await User.findOne({ email: 'admin@hotel.com' });
  console.log('User found:', user ? 'YES' : 'NO');
  if (user) {
    console.log('Password hash length:', user.password.length);
    console.log('Starts with $2a$ or $2b$:', user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
  }
  await mongoose.disconnect();
};

check();
