import { Router } from 'express';
import { PersonController } from '../controllers/personController';

const router = Router();

router.post('/', PersonController.createPerson);
router.put('/:id', PersonController.updatePerson);
router.delete('/:id', PersonController.deletePerson);

export default router;

