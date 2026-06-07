import { Router } from 'express';
import { dailyAccountController } from './daily-account.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', dailyAccountController.getDashboard);
router.get('/opening-balance', dailyAccountController.getOpeningBalance);
router.post('/closing', dailyAccountController.performClosing);
router.get('/', dailyAccountController.findAll);
router.get('/monthly-summary', dailyAccountController.getMonthlySummary);

export default router;