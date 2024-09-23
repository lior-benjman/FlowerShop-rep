import express from 'express';
import flowerRoutes from './flowerRoutes.js';
import orderRoutes from './orderRoutes.js';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();


router.use('/flowers', flowerRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (req, res) => res.status(200).json({ message: 'Server is alive' }));

export default router;

export const registerAllRoutes = (app) => {
    app.use('/api', router);
};