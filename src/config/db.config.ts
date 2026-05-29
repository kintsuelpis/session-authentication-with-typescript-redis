import mongoose from "mongoose";
import { config } from "dotenv"

config()

export default async function connectDB(){
    const mongodb_uri = process.env.MONGODB_URI!
    await mongoose.connect(mongodb_uri)
}