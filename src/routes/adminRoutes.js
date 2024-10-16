import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { flowerController } from '../controllers/flowerController.js';
import { orderController } from '../controllers/orderController.js';
import { config } from "../config/config.js";

const { mapsApiKey } = config;

const adminRouter = express.Router();

adminRouter.use(verifyToken, isAdmin);

adminRouter.get('/check', (req, res) => {
    res.json({ isAdmin: true });
});

adminRouter.get('/fetchMapsApi', (req, res) => {
    res.json({ mapsApiKey });
});

//ordersManagement
adminRouter.get('/orders', orderController.getAll);
adminRouter.put('/orders/:id/status', orderController.updateOrderStatus);
adminRouter.put('/orders/:id/cancel', orderController.cancelOrder);
adminRouter.get('/status/:status', orderController.getProcessingOrders);
adminRouter.delete('/orders/:id', orderController.delete);

//flowersManagement
adminRouter.post('/add-flower', flowerController.create);
adminRouter.put('/:id/stock', flowerController.updateStock);
adminRouter.put('/:id', flowerController.update);
adminRouter.delete('/flowers/:id', flowerController.delete);

// Statistics routes
adminRouter.get('/statistics/orders-revenue', orderController.getOrdersRevenueStats);
adminRouter.get('/statistics/revenue-by-item', orderController.getRevenueByItemStats);
adminRouter.get('/statistics/top-selling-flowers', orderController.getTopSellingFlowers);

export default adminRouter;