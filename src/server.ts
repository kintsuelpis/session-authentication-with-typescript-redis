import express from "express"
import connectDB from "./config/db.config.js"
import { config } from "dotenv"
import cookieParser from "cookie-parser"
import authRouter from './routes/auth.routes.js'

config()

connectDB().then(()=>{
    console.log("Mongodb database connected successfully")
    
    const PORT = process.env.PORT || 3000
    const app = express()

    app.use(express.json())
    app.use(cookieParser())

    // Authentication routes
    app.use('/auth',authRouter)

    app.listen(PORT,()=>{
        console.log(`server started running on port : ${PORT}`)
    })
}).catch((error)=>{
    console.error("An error Occured while starting a server : ",error)
})