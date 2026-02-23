import { Router } from 'express';
import { FamilyController } from '../controllers/familyController';

const router = Router();

router.post('/', FamilyController.createFamily);
router.get('/:token', FamilyController.getFamily);

export default router;

