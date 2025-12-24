import { Router } from 'express';
import { ideaController } from '../controllers/idea.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All idea routes require authentication
router.use(authMiddleware);

router.post('/', ideaController.create);
router.get('/', ideaController.list);
router.delete('/:id', ideaController.delete);
router.patch('/:id', ideaController.update);

router.post('/:id/forge', ideaController.forge);
router.post('/:id/stress-test', ideaController.stressTest);
router.post('/:id/consult', ideaController.consult);
router.post('/:id/refine', ideaController.refine);

// Smaller Sparks
router.post('/:id/sparks', ideaController.addSpark);
router.delete('/:id/sparks/:sparkId', ideaController.deleteSpark);

export default router;
