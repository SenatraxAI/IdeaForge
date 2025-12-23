import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/**
 * Health check endpoint to verify server is running.
 * @param {Request} req - The express request object.
 * @param {Response} res - The express response object.
 */
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'IdeaForge Backend is running' });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

export { app };
