import * as z from "zod"

const baseEmailSchema = z.object({
    email : z.email({"error" : (issues)=>{
        if(issues.input === undefined){
            return "Email Required"
        }
        return "Invalid email"
    }}),
    password : z.string()
})

const baseUserSchema = z.object({
    username : z.string(),
    password : z.string()
})

export const loginBodySchema = z.union([baseEmailSchema,baseUserSchema])

export type LoginBody = z.infer<typeof loginBodySchema>