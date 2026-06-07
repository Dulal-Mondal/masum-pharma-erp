import { Router } from 'express';
import { expenseController } from './expense.controller';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Expenses
router.post('/', expenseController.create);
router.get('/', expenseController.findAll);
router.put('/:id', expenseController.update);
router.delete('/:id', expenseController.delete);

// Categories
router.get('/categories/list', expenseController.getCategories);
router.post('/categories', requireAdmin, expenseController.createCategory);
router.delete('/categories/:id', requireAdmin, expenseController.deleteCategory);

export default router;