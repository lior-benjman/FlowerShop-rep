import express from 'express';
import { orderController } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post('/', orderController.create);
orderRouter.get('/', orderController.getAll);
orderRouter.get('/:id', orderController.getById);
orderRouter.put('/:id', orderController.update);
orderRouter.delete('/:id', orderController.delete);

export default orderRouter;