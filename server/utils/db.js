const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Force IPv4 as a common fix for SSL Alert 80 on Windows/Node 17+
      family: 4,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Check if it's the specific SSL error and provide helpful advice
    if (error.message.includes('ssl')) {
      console.log('💡 TIP: Check your MongoDB Atlas Network Access whitelist. Ensure 0.0.0.0/0 is added.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
