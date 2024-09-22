import express from 'express';
import { userController } from '../controllers/userController.js';

const authRouter = express.Router();

authRouter.post('/login', userController.login);

export default authRouter;