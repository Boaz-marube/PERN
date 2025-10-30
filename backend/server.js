import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import cors from "cors"
import dotenv from "dotenv"

import productRoutes from "./routes/productRoutes.js"
import {sql} from './config/config.js'
import { aj } from "./lib/arcjet.js"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5002

app.use(express.json())
app.use(cors())
app.use(helmet()) 
app.use(morgan("dev")) // logging

// apply arcjet rate-limit to all routes
app.use(async (req, res, next) => {
    try {
      const decision = await aj.protect(req, {
        requested: 1, // specifies that each request consumes 1 token
      });
  
      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          res.status(429).json({ error: "Too Many Requests" });
        } else if (decision.reason.isBot()) {
          res.status(403).json({ error: "Bot access denied" });
        } else {
          res.status(403).json({ error: "Forbidden" });
        }
        return;
      }
  
      // check for spoofed bots
      if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
        res.status(403).json({ error: "Spoofed bot detected" });
        return;
      }
  
      next();
    } catch (error) {
      console.log("Arcjet error", error);
      next(error);
    }
  });


app.use("/api/products", productRoutes)

async function initDB(){
    try {
        await sql`
             ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP; `
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