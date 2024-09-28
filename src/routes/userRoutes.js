import express from 'express';
import { userController } from '../controllers/userController.js';
import { orderController } from '../controllers/orderController.js';
import { verifyToken } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.use(verifyToken);

userRouter.post('/', userController.create);
userRouter.get('/', userController.getAll);
userRouter.get('/:id', userController.getById);
userRouter.put('/:id', userController.update);
userRouter.delete('/:id', userController.delete);

userRouter.post('/cart/add', userController.addToCart);
userRouter.delete('/cart/remove', userController.removeFromCart);
userRouter.put('/cart/update', userController.updateCartItemQuantity);
userRouter.post('/cart/clear', userController.clearCart);
userRouter.get('/cart/:userId', userController.getCart);
userRouter.post('/cart/create-from-cart/:userId', orderController.createFromCart);

userRouter.put('/change-password', userController.changePassword);

userRouter.get('/:userId/orders', userController.getUserOrders);

userRouter.get('/profile/:userId', userController.getUserProfile);
userRouter.put('/profile/:userId', userController.updateUserProfile);


export default userRouter;