import dotenv from 'dotenv';

dotenv.config();

const openaiApiKey = process.env.OPENAI_API_KEY || '';
const assemblyAiApiKey = process.env.ASSEMBLYAI_API_KEY || '';
const placeholderPatterns = [
    'your_openai_api_key',
    'your_assemblyai_api_key',
    'replace_me',
    'changeme',
];

const hasPlaceholderOpenAiKey =
    openaiApiKey &&
    placeholderPatterns.some((pattern) =>
        openaiApiKey.toLowerCase().includes(pattern),
    );

const hasPlaceholderAssemblyAiKey =
    assemblyAiApiKey &&
    placeholderPatterns.some((pattern) =>
        assemblyAiApiKey.toLowerCase().includes(pattern),
    );

export const env = {
    port: process.env.PORT || 4000,
    host: process.env.HOST || '127.0.0.1',
    clientUrl: process.env.CLIENT_URL || 'http://127.0.0.1:5173',
    nodeEnv: process.env.NODE_ENV || 'development',
    openaiApiKey,
    assemblyAiApiKey,
    hasPlaceholderOpenAiKey,
    hasPlaceholderAssemblyAiKey,
};
