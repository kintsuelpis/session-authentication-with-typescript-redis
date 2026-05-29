import {Redis}  from 'ioredis'

const redisClient = new Redis({
    host : process.env.REDIS_HOST ?? "localhost",
    port : Number(process.env.REDIS_PORT),
    // password : process.env.REDIS_PASSWORD,
    enableReadyCheck : true,
    maxRetriesPerRequest : 3,
    retryStrategy : (times : number)=>{
        if(times > 10)return null
        return Math.min(times*100,3000)
    }
})

redisClient.on('connect',()=>{
    console.log("Redis Connected")
})
redisClient.on('error',(err: any)=>{
    console.error("Redis Error:",err)
})
redisClient.on("reconnecting",()=>{
    console.log("Redis reconnecting...")
})

export default redisClient