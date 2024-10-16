import express from 'express';
import { flowerController } from '../controllers/flowerController.js';

const flowerRouter = express.Router();

flowerRouter.get('/get-info', flowerController.getInfo);

flowerRouter.get('/filter-options', flowerController.getFilterOptions);

flowerRouter.post('/', flowerController.create);
flowerRouter.get('/', flowerController.getAll);
flowerRouter.get('/:id', flowerController.getById);

export default flowerRouter;

