import express from 'express';
import { flowerController } from '../controllers/flowerController.js';

const flowerRouter = express.Router();

flowerRouter.post('/', flowerController.create);
flowerRouter.get('/', flowerController.getAll);
flowerRouter.get('/:id', flowerController.getById);
flowerRouter.put('/:id', flowerController.update);
flowerRouter.delete('/:id', flowerController.delete);

export default flowerRouter;