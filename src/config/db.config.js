import mongoose from "mongoose";


async function dbConnection() {
    mongoose.connect(process.env.mongoDB_URI)
}