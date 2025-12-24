import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let client: MongoClient;
let db: Db;

/**
 * Connects to the MongoDB database.
 * This should be called once when the server starts.
 * @returns {Promise<Db>} The database instance.
 */
export async function connectToDatabase(): Promise<Db> {
    if (db) return db;

    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('MONGODB_URI is not defined in the environment variables.');
    }

    try {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db('ideaforge');
        console.log('Successfully connected to MongoDB');
        return db;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

/**
 * Returns the database instance.
 * @returns {Db} The database instance.
 * @throws Error if the database is not connected.
 */
export function getDb(): Db {
    if (!db) {
        throw new Error('Database not connected. Call connectToDatabase first.');
    }
    return db;
}
