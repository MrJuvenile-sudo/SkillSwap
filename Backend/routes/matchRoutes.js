// Backend/routes/matchRoutes.js
import { Router } from 'express';
import { getAiMatches, getRecommendedPeers, getMatchHistory } from '../controllers/matchController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/recommendations', getRecommendedPeers);
router.get('/ai', authMiddleware, getAiMatches);
router.get('/history', authMiddleware, getMatchHistory);

export default router;
