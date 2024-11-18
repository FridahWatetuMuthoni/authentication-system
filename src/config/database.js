import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const environment = process.env.ENV;
let database_url =
  environment === "dev" ? process.env.MONGO_LOCAL : process.env.MONGO_URI;

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(database_url);
    console.log(`MongoDB connected: ${connect.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDB;
