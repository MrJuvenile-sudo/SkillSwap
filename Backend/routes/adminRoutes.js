// Backend/routes/adminRoutes.js
import { Router } from 'express';
import { getAdminAnalytics, getAllUsersAdmin, updateUserStatus, getReports, resolveReport } from '../controllers/adminController.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));

router.get('/analytics', getAdminAnalytics);
router.get('/users', getAllUsersAdmin);
router.put('/users/:id/status', updateUserStatus);
router.get('/reports', getReports);
router.put('/reports/:id/resolve', resolveReport);

export default router;
