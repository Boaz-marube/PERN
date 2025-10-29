import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5002

app.use(express.json())
app.use(cors())
app.use(helmet()) 
app.use(morgan("dev")) // logging

app.listen(5002, () => {
    console.log(`Server is running on port ${PORT}`)
})