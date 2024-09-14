import express from 'express';
import { userController } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/', userController.create);
userRouter.get('/', userController.getAll);
userRouter.get('/:id', userController.getById);
userRouter.put('/:id', userController.update);
userRouter.delete('/:id', userController.delete);

export default userRouter;