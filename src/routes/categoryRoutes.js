import express from 'express';
import { categoryController } from '../controllers/categoryController.js';

const categoryRrouter = express.Router();

categoryRrouter.post('/', categoryController.create);
categoryRrouter.get('/', categoryController.getAll);
categoryRrouter.get('/:id', categoryController.getById);
categoryRrouter.put('/:id', categoryController.update);
categoryRrouter.delete('/:id', categoryController.delete);

export default categoryRrouter;