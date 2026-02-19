import express from 'express'
import router from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'

const app = express()
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('homepage')
})

app.use('/api/auth', router)

export default app