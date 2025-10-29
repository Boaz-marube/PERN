import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import cors from "cors"
import dotenv from "dotenv"

import productRoutes from "./routes/productRoutes.js"
import {sql} from './config/config.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5002

app.use(express.json())
app.use(cors())
app.use(helmet()) 
app.use(morgan("dev")) // logging

app.use("/api/products", productRoutes)

async function initDB(){
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS products(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            image VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       
        )`
        console.log('DB Initialised successfully')
    } catch (error) {
        console.error(error)
    }
    
}
initDB().then(() => {
    app.listen(5002, () => {
        console.log(`Server is running on port ${PORT}`)
})

})