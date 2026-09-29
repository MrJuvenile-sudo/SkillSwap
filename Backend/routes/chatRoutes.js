// Backend/routes/chatRoutes.js
import { Router } from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/conversations', getConversations);
router.get('/messages/:peerId', getMessages);
router.post('/messages', sendMessage);

export default router;
