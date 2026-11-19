import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connectDB.ts';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoute from './routes/auth.route.ts';
import awsRoute from './routes/aws.route.ts';
import { errorHandler } from './middlewares/errorHandler.ts';
import { notFound } from './middlewares/notFound.ts';

dotenv.config();


const app = express();

const PORT = process.env.PORT || 3000;
const allowedOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
    : ['http://localhost:5173'];

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

// api
app.use('/api/v1/user', userRoute);
app.use('/api/v1/aws', awsRoute);
app.use(notFound);
app.use(errorHandler);

const bootstrap = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
};

void bootstrap();