import mongoose from "mongoose";


export async function dbConnection() {
    await mongoose.connect(process.env.mongoDB_URI)
        .then(e => {
            console.log(`MongoDB connected at PORT ${e.connection.port} & ${e.connection.name}`);
        })
        .catch(error => {
            console.log("mongoDB error: ", error)
            process.exit(1)
        })
}