require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const reset = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User.model');
  
  const email = 'admin@hotel.com';
  const newPassword = 'admin123';
  
  const user = await User.findOne({ email });
  if (user) {
    user.password = newPassword;
    await user.save();
    console.log(`✅ Password reset successfully for ${email}`);
  } else {
    console.log(`❌ User ${email} not found!`);
  }
  
  await mongoose.disconnect();
  process.exit(0);
};

reset().catch(err => {
  console.error(err);
  process.exit(1);
});
