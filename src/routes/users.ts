import { Router, json } from 'express';
import { join, login } from '../controllers/UserController';

const router: Router = Router();

router.use(json());

router.post('/join', join);
router.post('/login', login);

export default router;