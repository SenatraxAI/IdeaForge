import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth.js';
import { connectToDatabase, getDb } from './config/db.js';
import ideaRoutes from './routes/idea.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
    'http://localhost:5173',
    'https://forge.senatraxai.com',
    'https://forge.senatraxai.com/',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/ideas', ideaRoutes);

/**
 * Health check endpoint to verify server is running.
 * @param {Request} req - The express request object.
 * @param {Response} res - The express response object.
 */
app.get('/health', async (req: Request, res: Response) => {
    try {
        const db = getDb();
        // Ping the database to check connectivity
        await db.command({ ping: 1 });
        res.status(200).json({
            status: 'OK',
            database: 'Connected',
            message: 'IdeaForge Backend and Database are running'
        });
    } catch (error) {
        res.status(500).json({
            status: 'Error',
            database: 'Disconnected',
            message: 'Backend is running but cannot connect to database'
        });
    }
});

/**
 * Protected endpoint to verify authentication.
 */
app.get('/api/secure', authMiddleware, (req: Request, res: Response) => {
    res.status(200).json({
        message: 'You have accessed a protected route!',
        user: (req as any).user
    });
});

if (process.env.NODE_ENV !== 'test') {
    connectToDatabase().then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    });
}

export { app };
// Trigger Restart
