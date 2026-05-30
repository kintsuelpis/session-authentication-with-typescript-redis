import { type Request, type Response, type NextFunction } from "express";
import { SessionService } from "../services/session.service.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
)=>{
    try {
        const sid = req.cookies?.sid;

        if (!sid) {
            return res.status(401).json({
            success: false,
            message: "Missing Session ID",
            });
        }

        const userDetails =
            await SessionService.getSession(sid);

        if (!userDetails) {
            return res.status(401).json({
            success: false,
            message: "Session expired or incorrect Session ID",
            });
        }

        req.user = {
            userId: userDetails.userId,
            email: userDetails.email,
            username: userDetails.username,
        };

        req.session = {
            sessionId: sid,
            createdAt: userDetails.createdAt,
            lastAccessedAt: userDetails.lastAccessedAt,
        };
        
        return next();
    }
    catch(error){
        console.error("An error occured in the Auth Middleware", error);

        return res.status(500).json({
            success: false,
            message: "An internal server error occured !",
        });
    }
};
