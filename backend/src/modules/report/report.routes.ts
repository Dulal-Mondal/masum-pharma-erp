import { Router } from 'express';
import { reportController } from './report.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/daily', reportController.getDailyReport);
router.get('/purchase', reportController.getPurchaseReport);
router.get('/purchase/company-wise', reportController.getCompanyWisePurchase);
router.get('/expense', reportController.getExpenseReport);
router.get('/cash-transactions', reportController.getCashTransactionReport);

export default router;