import { Router, json } from 'express';
import { join } from '../controllers/UserController';

const router: Router = Router();

router.use(json());

router.post('/join', join);

export default router;