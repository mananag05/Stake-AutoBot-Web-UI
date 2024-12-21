import mongoose from 'mongoose';

/**
 * Connect to MongoDB using Mongoose.
 * @param url - MongoDB connection string.
 * @returns A Promise that resolves when the connection is successful.
 */
export async function connectToMongo(url: string): Promise<typeof mongoose> {
    try {
        console.log('Connecting to Mongo...');
        const connection = await mongoose.connect(url);
        console.log('Connected to MongoDB!');
        return connection;
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}
