import mongoose from 'mongoose';
import { config } from '../config/config.js';

const { mongoUrl } = config;

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
