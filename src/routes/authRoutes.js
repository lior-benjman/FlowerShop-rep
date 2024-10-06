import express from 'express';
import { userController } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';


const authRouter = express.Router();

authRouter.post('/login', userController.login);
authRouter.post('/signup', userController.signup);
authRouter.get('/check-token', verifyToken, (req, res) => {
    res.status(200).json({ valid: true });
});
authRouter.put('/:id/change-password', userController.changePassword);

export default authRouter;