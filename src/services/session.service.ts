import crypto from "node:crypto"
import redisClient from "../config/redis.config.js"
import type { SessionData } from "../types/session.types.js"

const SESSION_TTL = process.env.SESSION_TTL_SECONDS || 2000

export class SessionService{
    static async createSession(
        userId : string,
        metadata : Omit<SessionData,'createdAt' | 'lastAccessedAt'>
    ){
        const sessionId : string = crypto.randomBytes(32).toString('hex')
        const sessionKey : string = `sess:${sessionId}`
        const userIndexKey : string = `user:${userId}:sessions`

        const now = Date.now()

        const fullSessionData : SessionData = {
            ...metadata,
            createdAt : now,
            lastAccessedAt : now
        }

        const pipeline = redisClient.pipeline()
        
        pipeline.set(sessionKey,JSON.stringify(fullSessionData),'EX',SESSION_TTL)
        pipeline.sadd(userIndexKey,sessionId)
        pipeline.expire(userIndexKey,SESSION_TTL)

        await pipeline.exec()

        return sessionId
    }

    static async getSession(sessionId : string) : Promise<SessionData | null>{
            const sessionKey = `sess:${sessionId}`
            const rawData = await redisClient.get(sessionKey)

            if(!rawData)return null

            const session : SessionData = JSON.parse(rawData)
            session.lastAccessedAt = Date.now()

            await redisClient.set(sessionKey,JSON.stringify(session),"EX",SESSION_TTL)
            return session
    }

    
    static async destroySession(sessionId : string) : Promise<void>{
        const session = await this.getSession(sessionId)
        if(!session)return;

        const sessionKey = `sess:${sessionId}`
        const userIndexKey = `user:${session.userId}:sessions`

        const pipeline = redisClient.pipeline()
        pipeline.del(sessionKey)
        pipeline.srem(userIndexKey,sessionId)

        await pipeline.exec()
    }

    static async invalidateAllUserSessions(userId : string) : Promise<void>{
        const userIndexKey = `user:${userId}:sessions`
        const sessionIds = await redisClient.smembers(userIndexKey)
        if(!sessionIds)return

        const pipeline = redisClient.pipeline()
        
        sessionIds.forEach((id)=>{
            pipeline.del(`sess:${id}`)
        })
        
        pipeline.del(userIndexKey)
        await pipeline.exec()
    }
}
