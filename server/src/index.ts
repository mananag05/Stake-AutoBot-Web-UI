import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { connectToMongo } from './configs/mongo';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || ''
app.use(express.json());

// routes import
import authenticationRouter from './routes/authentication';
// routes import

(async () => {
    try {
        await connectToMongo(MONGO_URL);
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
})();


// routes use
app.use('/', authenticationRouter);