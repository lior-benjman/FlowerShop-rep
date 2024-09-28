import express from 'express';
import { orderController } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post('/', orderController.create);
orderRouter.get('/:id', orderController.getById);
orderRouter.put('/:id', orderController.update);
orderRouter.delete('/:id', orderController.delete);

orderRouter.put('/update-status', orderController.updateOrderStatus);


orderRouter.get('/report', orderController.generateOrderReport);

orderRouter.post('/:orderId/cancel', orderController.cancelOrder);
orderRouter.get('/:orderId/details', orderController.getOrderDetails);


export default orderRouter;