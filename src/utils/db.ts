import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/myapp");
    console.log("Mongoose connection state:", mongoose.connection.readyState);
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};