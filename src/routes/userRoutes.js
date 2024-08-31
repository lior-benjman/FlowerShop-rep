import express from 'express';
import { getAllUsers, createUser } from './controllers/userController.js';

const userRouter = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);

export default userRouter;