import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('MONGODB_URI not found in .env');
    process.exit(1);
}

async function clearCache() {
    const client = new MongoClient(uri!);
    try {
        await client.connect();
        const db = client.db('ideaforge');
        const ideas = db.collection('ideas');
        const count = await ideas.countDocuments();
        console.log(`Total ideas found in DB: ${count}`);

        const result = await ideas.updateMany(
            {},
            { $unset: { marketResearch: "" } }
        );
        console.log(`Successfully cleared cache for ${result.modifiedCount} ideas.`);
    } catch (error) {
        console.error('Error clearing cache:', error);
    } finally {
        await client.close();
    }
}

clearCache();
