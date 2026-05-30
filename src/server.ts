import express from "express"
import connectDB from "./config/db.config.js"
import { config } from "dotenv"
import cookieParser from "cookie-parser"
import authRouter from './routes/auth.routes.js'
import { authMiddleware } from "./middleware/auth.middleware.js"
import dashboardRouter from './routes/dashboard.routes.js'
import cors from "cors"

config()

connectDB().then(()=>{
    console.log("Mongodb database connected successfully")
    
    const PORT = process.env.PORT || 3000
    const app = express()

    app.use(express.json())
    app.use(cookieParser())
    
    app.use((req, res, next) => {
        const instance = process.env.APP_INSTANCE_NAME || "Unknown_Server";
        console.log(`[${instance}] Handled request for: ${req.method} ${req.url}`);
        next();
    });
    
    
    app.use(cors({
        origin:"http://localhost:5173",
        credentials:true
    }))

    // Authentication routes
    app.use('/auth',authRouter)

    app.use('/dashboard',authMiddleware,dashboardRouter)

    app.listen(PORT,()=>{
        console.log(`server started running on port : ${PORT}`)
    })
}).catch((error)=>{
    console.error("An error Occured while starting a server : ",error)
})