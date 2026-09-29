// Backend/routes/hubRoutes.js
import { Router } from 'express';
import { getLearningCircles, joinLearningCircle, getResources, getCommunityPosts, createCommunityPost } from '../controllers/hubController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/circles', getLearningCircles);
router.post('/circles/:circleId/join', authMiddleware, joinLearningCircle);
router.get('/resources', getResources);
router.get('/posts', getCommunityPosts);
router.post('/posts', authMiddleware, createCommunityPost);

export default router;
