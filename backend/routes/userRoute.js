import express from 'express';
import { getCurrentUser, registerUser, updateProfile, loginUser, updatePassword } from '../controllers/userController.js';

import authMiddleware from '../middleware/auth.js'

const userRouter = express.Router();

//PUBLIC ROUTES/links

userRouter.post('/register', registerUser);
userRouter.post('/login',loginUser);


//PRIVATE ROUTES/links-protects through middleware
userRouter.get('/me', authMiddleware, getCurrentUser);
userRouter.put('/profile',authMiddleware, updateProfile);
userRouter.put('/password',authMiddleware, updatePassword);

export default userRouter;