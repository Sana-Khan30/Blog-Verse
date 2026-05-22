import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // mongoose.connect() MongoDB Atlas se connection establish karta hai
    // process.env.MONGO_URI .env file se aata hai
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Agar connection fail ho toh poora app band karo
    // process.exit(1) matlab "error ke saath exit karo"
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;