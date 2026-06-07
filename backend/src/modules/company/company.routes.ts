import { Router } from 'express';
import { companyController } from './company.controller';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', companyController.findAll);
router.post('/', requireAdmin, companyController.create);
router.put('/:id', requireAdmin, companyController.update);
router.delete('/:id', requireAdmin, companyController.delete);

export default router;