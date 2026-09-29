// Backend/routes/authRoutes.js
import { Router } from 'express';
import { login, signup, getSession, logout, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/logout', logout);
router.get('/session', authMiddleware, getSession);
router.get('/me', authMiddleware, getSession);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
