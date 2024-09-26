import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { flowerController } from '../controllers/flowerController.js';

const adminRouter = express.Router();


adminRouter.use(verifyToken, isAdmin);

//adminRouter.get('/dashboard', );
adminRouter.get('/check', (req, res) => {
    res.json({ isAdmin: true });
  });
adminRouter.post('/add-flower', flowerController.create);
adminRouter.put('/:id/stock', flowerController.updateStock);
adminRouter.put('/:id', flowerController.update);


export default adminRouter;