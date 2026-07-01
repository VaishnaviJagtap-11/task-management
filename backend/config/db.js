import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    console.log("DB Connected")
  } catch (err) {
    console.log("DB ERROR:", err.message)
    process.exit(1)
  }
}