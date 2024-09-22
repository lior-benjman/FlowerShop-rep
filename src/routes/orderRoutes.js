import express from 'express';
import { orderController } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post('/', orderController.create);
orderRouter.get('/', orderController.getAll);
orderRouter.get('/:id', orderController.getById);
orderRouter.put('/:id', orderController.update);
orderRouter.delete('/:id', orderController.delete);

orderRouter.post('/create-from-cart', orderController.createFromCart);
orderRouter.put('/update-status', orderController.updateOrderStatus);

orderRouter.get('/status/:status', orderController.getOrdersByStatus);
orderRouter.get('/report', orderController.generateOrderReport);

orderRouter.post('/:orderId/cancel', orderController.cancelOrder);
orderRouter.get('/:orderId/details', orderController.getOrderDetails);


export default orderRouter;