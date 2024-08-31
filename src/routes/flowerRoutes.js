import express from 'express';
import { getAllFlowers, createFlower } from './controllers/flowerController.js';

const flowerRouter = express.Router();

router.get('/', getAllFlowers);
router.post('/', createFlower);

export default flowerRouter;