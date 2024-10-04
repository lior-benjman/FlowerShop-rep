import express from 'express';
import { flowerController } from '../controllers/flowerController.js';

const flowerRouter = express.Router();

flowerRouter.get('/filter-options', flowerController.getFilterOptions);

flowerRouter.post('/', flowerController.create);
flowerRouter.get('/', flowerController.getAll);
flowerRouter.get('/:id', flowerController.getById);
flowerRouter.delete('/:id', flowerController.delete);

flowerRouter.get('/top-selling', flowerController.getTopSellingFlowers);
flowerRouter.get('/new-arrivals', flowerController.getNewArrivals);


export default flowerRouter;