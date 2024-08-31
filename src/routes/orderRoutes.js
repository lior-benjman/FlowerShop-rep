import express from 'express';
import { getAllOrders, createOrder } from '../controllers/orderController.js';

const orderRouter = express.Router();

router.get('/', getAllOrders);
router.post('/', createOrder);

export default orderRouter;