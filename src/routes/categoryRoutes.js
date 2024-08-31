import express from 'express';
import { getAllCategories, createCategory } from '../controllers/categoryController.js';

const categoryRouter = express.Router();

router.get('/', getAllCategories);
router.post('/', createCategory);

export default categoryRouter;