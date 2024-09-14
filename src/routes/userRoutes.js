import express from 'express';
import { userController } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/', userController.create);
userRouter.get('/', userController.getAll);
userRouter.get('/:id', userController.getById);
userRouter.put('/:id', userController.update);
userRouter.delete('/:id', userController.delete);

userRouter.post('/cart/add', userController.addToCart);
userRouter.post('/cart/remove', userController.removeFromCart);
userRouter.put('/cart/update', userController.updateCartItemQuantity);
userRouter.post('/cart/clear', userController.clearCart);

userRouter.put('/change-password', userController.changePassword);

userRouter.get('/:userId/orders', userController.getUserOrders);


export default userRouter;