import express from 'express'
import router from './routes/auth.routes.js'

const app = express()


app.get('/', (req, res) => {
    res.send('homepage')
})

app.use('/api/auth', router)

export default app