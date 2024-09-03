import dotenv from 'dotenv';

dotenv.config();

export const config = {
    mongoUrl: process.env.MONGO_URL,
    serverPort: process.env.PORT || 8080,
}