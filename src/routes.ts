// src/routes.ts
import { Router } from 'express';
import { handleNewUser } from './controllers/userController';
import { createQuestion, isAdmin } from './controllers/adminController';
import { getQuestionById } from './controllers/questionController';

const router: Router = Router();

router.post('/user', handleNewUser);
router.post('/admin/questions', isAdmin, createQuestion);
router.get('/question/:id', getQuestionById);

export default router;