import express from 'express';
import { registerAllRoutes } from '../routes/index.js';

export const app = express();

await registerAllRoutes(app);

