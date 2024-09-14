import { Router } from 'express';
import { register, login, getQuestions, submitTest } from './controllers';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/questions', getQuestions);
router.post('/test/submit', submitTest);

export default router;
