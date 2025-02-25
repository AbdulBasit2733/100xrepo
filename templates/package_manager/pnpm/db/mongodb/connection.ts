import mongoose from "mongoose";
import { DATABASE_URL, DB_NAME } from "./config";
import chalk from "chalk";

const connectDB = async () => {
  try {
    await mongoose.connect(DATABASE_URL, { dbName: DB_NAME });
    console.log(chalk.green.bold("✅ MongoDB connected successfully"));
  } catch (err) {
    console.error(chalk.red.bold("❌ MongoDB connection failed"), err);
    process.exit(1);
  }
};

export default connectDB;
