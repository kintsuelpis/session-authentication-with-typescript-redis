import { type Request,type Response} from "express"
import User from "../models/user.model.js"
import { registerBodySchema } from "../schemas/auth/registration.schema.js"
import { loginBodySchema } from "../schemas/auth/login.schema.js"
import { ZodError } from "zod"
import { SessionService } from "../services/session.service.js"
import type { SessionData } from "../types/session.types.js"

export const registrationController = async(req : Request, res : Response)=>{
    try{
        // 1. Validate the Body
        const validateBody = registerBodySchema.parse(req.body)

        // 2. Add new User to the Database
        const newUser = await User.create(validateBody)

        // 3. Send the Success Message
        res.status(201).json({
            success : true,
            message : "User registered successfully",
            user : {id : newUser._id, username : newUser.email, email : newUser.email}
        })
    }   
    catch(error : unknown){
        // Invalid body Error
        if(error instanceof ZodError){
            res.status(400).json({
                success : false,
                message : "Validation failed"
            })   
            return;         
        }
        // Duplicate Key Error
        if(typeof error === "object" && error !== null && "code" in error && error.code === 11000){
            res.status(409).json({
                success:false,
                message:"Registration Failed"
            })
            return;
        }

        console.error("Critical Registration Error:",error)
        res.status(500).json({
            success : false,
            error : "An internal server error occured"
        })
    }
}

export const loginController = async(req : Request, res : Response)=>{
    try{
        // 1. Validate the body
        const validatedBody = loginBodySchema.parse(req.body);
        const query = "email" in validatedBody ? { email : validatedBody.email} : {username : validatedBody.username}
        
        // 2. Querying the Database to find the user
        const user = await User.findOne(query)
        if(!user){
            res.status(401).json({
                success : false,
                message: "Invalid username/email or password."
            })
            return;
        }

        const isMatch = await user.comparePassword(validatedBody.password)
        if(!isMatch){
             res.status(401).json({
                success : false,
                message: "Invalid username/email or password."
            })
            return;
        }   
        

        const sessionPayload : SessionData = {
            "userId": user._id.toString(),
            "email": user.email,
            username: user.username,
            createdAt: Date.now(),
            lastAccessedAt: Date.now()
        }

        const sessionId = await SessionService.createSession(sessionPayload.userId,sessionPayload)
        
        res.cookie("sid",sessionId,{
            httpOnly:true,
            sameSite:"lax",
            maxAge : Number(process.env.SESSION_TTL_SECONDS ?? 604800)*1000,
            path:"/"
        })

        res.status(200).json({
            success : true,
            message : "Login Successful"
        })
    }
    catch(error : unknown){
        if(error instanceof ZodError){
            res.status(400).json({
                success : false,
                message : "Validation Failed",
            })
            return;
        }

        console.error("Critical Login Error:",error);
        res.status(500).json({
            success:false,
            message : "An internal server error occured."
        })

    }
}

