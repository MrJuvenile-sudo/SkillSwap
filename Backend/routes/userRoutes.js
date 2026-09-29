// Backend/routes/userRoutes.js
import { Router } from 'express';
import { getUserProfile, updateProfile, addUserSkill, removeUserSkill, getAllUsers } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getAllUsers);
router.get('/profile/:id', getUserProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/skills', authMiddleware, addUserSkill);
router.delete('/skills/:id', authMiddleware, removeUserSkill);

export default router;
