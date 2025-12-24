import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth.js';
import { connectToDatabase } from './config/db.js';
import ideaRoutes from './routes/idea.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:5173',
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
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'IdeaForge Backend is running' });
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
