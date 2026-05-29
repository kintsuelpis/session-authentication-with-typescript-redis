import * as z from "zod"

const passwordRegex : RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/

export const registerBodySchema = z.object({
    username : z.string().min(4,"Username must be at least 4 characters long").max(16,"Username must at most 16 characters long"),
    email : z.email({
        error : (issues)=>{
            if(issues.input === undefined){
                return "Email Required"
            }
            else{
                return "Invalid Email"
            }
        }
    }),
    password : z.string().min(6,"Password must contain at least 6 characters").regex(
        passwordRegex,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
})

export type RegisterBody = z.infer<typeof registerBodySchema>