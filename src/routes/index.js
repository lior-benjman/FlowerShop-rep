import express from 'express';
import flowerRoutes from './flowerRoutes.js';
import orderRoutes from './orderRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();


router.use('/flowers', flowerRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);

router.get('/health', (req, res) => res.status(200).json({ message: 'Server is alive' }));

export default router;