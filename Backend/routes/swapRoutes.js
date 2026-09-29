// Backend/routes/swapRoutes.js
import { Router } from 'express';
import { createRequest, getUserRequests, respondRequest, submitReview } from '../controllers/swapController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/request', createRequest);
router.get('/requests', getUserRequests);
router.put('/request/:id/status', respondRequest);
router.post('/review', submitReview);

export default router;
