import mongoose from "mongoose"
import bcrypt from "bcrypt"

interface iUser extends mongoose.Document{
    email : string,
    username : string,
    password : string,
    comparePassword(candidatePassword : string): Promise<boolean>
}

const userSchema = new mongoose.Schema({
    "username" : {
        type : String,
        required : true,
        unique : true
    },
    "email" : {
        type : String,
        required : true,
        unique : true
    },
    "password" : {
        type : String,
        required : true
    }
},
    {
        timestamps : true
    }
)

userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    try {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
        return;
    } catch (error: any) {
        throw error
    }
});

userSchema.methods.comparePassword = async function(this : iUser, candidatePassword : string) : Promise<boolean>{
    try{
        return await bcrypt.compare(candidatePassword,this.password)
    }
    catch(error){
        throw error;
    }
}

const User = mongoose.model<iUser>("User",userSchema)
export default User