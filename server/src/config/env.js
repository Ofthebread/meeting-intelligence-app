import dotenv from 'dotenv';

dotenv.config();

export const env = {
    port: process.env.PORT || 4000,
    host: process.env.HOST || '127.0.0.1',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    nodeEnv: process.env.NODE_ENV || 'development',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
};
