import express from 'express';
import { getMyProfile, refreshMyStats, getAiSuggestion } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.post('/refresh-stats', protect, refreshMyStats);
router.post('/ai-suggestion', protect, getAiSuggestion);

export default router;