import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import dotenv from 'dotenv';

dotenv.config();

const client = jwksClient({
    jwksUri: `${process.env.KINDE_DOMAIN}/.well-known/jwks.json`
});

/**
 * Gets the signing key for JWT verification.
 */
function getKey(header: any, callback: any) {
    client.getSigningKey(header.kid, (err, key) => {
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
    });
}

/**
 * Middleware to verify Kinde JWT tokens.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // DEV MODE BYPASS
    if (process.env.NODE_ENV !== 'production') {
        (req as any).user = { sub: 'dev_user_123', email: 'dev@ideaforge.app', given_name: 'Dev' };
        return next();
    }

    const authHeader = req.headers.authorization;
    // ... rest of the logic
}
