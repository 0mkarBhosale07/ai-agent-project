import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017'; // Update if using MongoDB Atlas
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        // console.log('Connected to MongoDB');
        return client.db('todoApp'); // Database name
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
    }
}

export default connectDB;
