import { Router } from 'express';
import { cashTransactionController } from './cash-transaction.controller';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', cashTransactionController.create);
router.get('/', cashTransactionController.findAll);
router.put('/:id', cashTransactionController.update);
router.delete('/:id', cashTransactionController.delete);

// Transaction types
router.get('/types/list', cashTransactionController.getTypes);
router.post('/types', requireAdmin, cashTransactionController.createType);

export default router;