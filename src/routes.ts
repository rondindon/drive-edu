// src/routes.ts
import { Router } from 'express';
import { handleNewUser } from './controllers/userController';
import { createQuestion, deleteQuestion, getAllQuestions, isAdmin, updateQuestion } from './controllers/adminController';
import { getQuestionById } from './controllers/questionController';
import { authenticate } from './middleware/auth';

const router: Router = Router();

router.post('/user', handleNewUser);
router.get('/question/:id', getQuestionById);

router.get('/admin/questions',authenticate,isAdmin, getAllQuestions);
router.post('/admin/questions',authenticate, isAdmin, createQuestion);
router.put('/admin/questions/:id',authenticate, isAdmin, updateQuestion);
router.delete('/admin/questions/:id',authenticate, isAdmin, deleteQuestion);

export default router;