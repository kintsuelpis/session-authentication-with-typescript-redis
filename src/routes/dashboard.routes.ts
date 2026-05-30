import { Router } from "express";

const router = Router()

router.get("/user",async(req,res)=>{
    try{
        const {userId, email, username } = req.user!
        res.status(200).json({
            userId : userId,
            email : email,
            username : username
        })
    }
    catch(error : any){
        console.error('An internal Server Error Occurd')
        res.status(500).json({
            success : false,
            message: "An internal server error occured"
        })
    }
})

export default router