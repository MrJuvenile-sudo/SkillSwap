// Backend/routes/index.js - Unified API Router
import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import swapRoutes from './swapRoutes.js';
import matchRoutes from './matchRoutes.js';
import chatRoutes from './chatRoutes.js';
import hubRoutes from './hubRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

// Mount individual domain route modules
router.use('/auth', authRoutes);
router.use('/account', authRoutes); // Compatibility with /api/account/login, etc.
router.use('/users', userRoutes);
router.use('/swaps', swapRoutes);
router.use('/matches', matchRoutes);
router.use('/chat', chatRoutes);
router.use('/hub', hubRoutes);
router.use('/admin', adminRoutes);

export default router;
