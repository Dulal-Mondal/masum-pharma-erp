import { Router } from 'express';
import { purchaseController } from './purchase.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', purchaseController.create);
router.get('/', purchaseController.findAll);
router.get('/:id', purchaseController.findById);
router.put('/:id', purchaseController.update);
router.delete('/:id', purchaseController.delete);

export default router;