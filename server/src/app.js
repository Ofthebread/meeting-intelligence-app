import express from 'express';
import cors from 'cors';
import meetingRoutes from './routes/meetingRoutes.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { env } from './config/env.js';

const app = express();

app.use(
    cors({
        origin: env.clientUrl,
    }),
);

app.use(express.json());

app.use('/api', meetingRoutes);

app.use(errorMiddleware);

export default app;
