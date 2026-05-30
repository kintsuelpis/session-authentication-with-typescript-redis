import crypto from "node:crypto"
import redisClient from "../config/redis.config.js"
import type { SessionData } from "../types/session.types.js"

const SESSION_TTL = Number.parseInt(
    process.env.SESSION_TTL_SECONDS ?? "2000",
    10
);
export class SessionService{
    private static getSessionKey(sessionId: string): string {
        return `sess:${sessionId}`;
    }

    private static getUserIndexKey(userId: string): string {
        return `user:${userId}:sessions`;
    }

    private static async getSessionRaw(
        sessionId: string
    ): Promise<SessionData | null> {
        const sessionKey = this.getSessionKey(sessionId);

        const rawData = await redisClient.get(sessionKey);

        if (!rawData) return null;

        return JSON.parse(rawData) as SessionData;
    }
    

    static async createSession(
        userId : string,
        metadata : Omit<SessionData,'createdAt' | 'lastAccessedAt'>
    ){
        const sessionId : string = crypto.randomBytes(32).toString('hex')
        const sessionKey = this.getSessionKey(sessionId);
        const userIndexKey = this.getUserIndexKey(userId);
        
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

    static async getSession(
        sessionId: string
    ): Promise<SessionData | null> {
        const session = await this.getSessionRaw(sessionId);

        if (!session) return null;

        const updatedSession: SessionData = {
            ...session,
            lastAccessedAt: Date.now(),
        };

        const sessionKey = this.getSessionKey(sessionId);
        const userIndexKey = this.getUserIndexKey(session.userId);

        const pipeline = redisClient.pipeline();

        pipeline.set(
            sessionKey,
            JSON.stringify(updatedSession),
            "EX",
            SESSION_TTL
        );

        // Keep the user index alive as long as the session is alive
        pipeline.expire(userIndexKey, SESSION_TTL);

        await pipeline.exec();

        return updatedSession;
    }

    
    static async destroySession(
        sessionId: string
    ): Promise<void> {
        const session = await this.getSessionRaw(sessionId);

        if (!session) return;

        const sessionKey = this.getSessionKey(sessionId);
        const userIndexKey = this.getUserIndexKey(session.userId);

        const pipeline = redisClient.pipeline();

        pipeline.del(sessionKey);
        pipeline.srem(userIndexKey, sessionId);

        await pipeline.exec();
    }

    static async invalidateAllUserSessions(userId : string) : Promise<void>{
        const userIndexKey = this.getUserIndexKey(userId)
        const sessionIds = await redisClient.smembers(userIndexKey)
        if(sessionIds.length === 0)return

        const pipeline = redisClient.pipeline()
        
        sessionIds.forEach((id)=>{
            pipeline.del(this.getSessionKey(id))
        })
        
        pipeline.del(userIndexKey)
        await pipeline.exec()
    }
}
