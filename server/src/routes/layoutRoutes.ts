import { Router } from 'express';
import { LayoutController } from '../controllers/layoutController';

const router = Router();

router.post('/', LayoutController.saveLayout);
router.get('/:token', LayoutController.getLayout);

export default router;

