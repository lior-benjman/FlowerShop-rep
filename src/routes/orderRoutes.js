import express from 'express';
import { orderController } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post('/', orderController.create);
orderRouter.get('/:id', orderController.getById);


orderRouter.get('/:orderId/details', orderController.getOrderDetails);


export default orderRouter;