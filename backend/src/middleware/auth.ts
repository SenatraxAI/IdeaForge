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
        if (err) {
            callback(err);
            return;
        }
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
    });
}

/**
 * Middleware to verify Kinde JWT tokens.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // DEV MODE BYPASS
    // On local machine, we might want to skip real Kinde check
    if (process.env.NODE_ENV !== 'production' && !process.env.KINDE_DOMAIN) {
        console.log('[AUTH] Dev Mode Bypass Active');
        (req as any).user = { sub: 'dev_user_123', email: 'dev@ideaforge.app', given_name: 'Dev' };
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('[AUTH] Missing or invalid authorization header');
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, getKey, {
        algorithms: ['RS256'],
        issuer: process.env.KINDE_DOMAIN
    }, (err, decoded) => {
        if (err) {
            console.error('[AUTH] Token verification failed:', err.message);
            return res.status(401).json({ message: 'Unauthorized' });
        }
        (req as any).user = decoded;
        next();
    });
};
