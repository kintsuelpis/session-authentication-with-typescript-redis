export interface SessionData{
    userId : string,
    email : string,
    username : string,

    userAgent? : string,
    ipAddress? : string,

    createdAt: number,
    lastAccessedAt: number
}

declare global{
    namespace Express{
        interface Request{
            session? : SessionData & {sessionId : string}
        }
    }
}
