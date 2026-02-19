import app from "./src/app.js";
import { dbConnection } from "./src/config/db.config.js";
import dotenv from 'dotenv'

dotenv.config()
dbConnection()

const PORT = 8001

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`))