import dotenv from 'dotenv';

dotenv.config();

const openaiApiKey = process.env.OPENAI_API_KEY || '';
const placeholderPatterns = [
    'your_openai_api_key',
    'replace_me',
    'changeme',
];

const hasPlaceholderOpenAiKey =
    openaiApiKey &&
    placeholderPatterns.some((pattern) =>
        openaiApiKey.toLowerCase().includes(pattern),
    );

export const env = {
    port: process.env.PORT || 4000,
    host: process.env.HOST || '127.0.0.1',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    nodeEnv: process.env.NODE_ENV || 'development',
    openaiApiKey,
    hasPlaceholderOpenAiKey,
};
