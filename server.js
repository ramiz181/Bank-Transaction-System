import app from "./src/app.js";
import { dbConnection } from "./src/config/db.config.js";
import dotenv from 'dotenv'
import { sendRegistrationEmail } from "./src/services/email.service.js";

dotenv.config()
dbConnection()



const PORT = 8001

app.get('/email', (req, res) => {
    sendRegistrationEmail('ramizmalik18121@gmail.com', 'Meekal')
    res.send('email sent')
})

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`))