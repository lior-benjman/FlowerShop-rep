import express from 'express';
import { getAllFlowers, createFlower } from './controllers/flowerController.js';

const router = express.Router();

router.get('/', getAllFlowers);
router.post('/', createFlower);

export default router;