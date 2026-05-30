export interface SessionData{
    userId : string,
    email : string,
    username : string,

    userAgent? : string,
    ipAddress? : string,

    createdAt: number,
    lastAccessedAt: number
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                username: string;
            };

            session?: {
                sessionId: string;
                createdAt: number;
                lastAccessedAt: number;
            };
        }
    }
}