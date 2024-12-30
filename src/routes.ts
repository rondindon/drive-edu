// src/routes.ts
import { Router } from 'express';
import { getUserByEmail, handleNewUser, updateUsername } from './controllers/userController';
import { createQuestion, deleteQuestion, getAllQuestions, isAdmin, updateQuestion } from './controllers/adminController';
import { getQuestionById } from './controllers/questionController';
import { authenticate } from './middleware/auth';
import { deleteUser, getAllUsers, updateUser } from './controllers/adminUserController';
import { finishTest, getAllTests, recordUserAnswer, recordWrongAnswer, startTest } from './controllers/testController';

const router: Router = Router();

router.post('/user', handleNewUser);
router.get('/user', getUserByEmail);
router.get('/question/:id', getQuestionById);

router.get('/admin/users', authenticate, isAdmin, getAllUsers);
router.put('/admin/users/:id', authenticate, isAdmin, updateUser);
router.delete('/admin/users/:id', authenticate, isAdmin, deleteUser);

router.put('/users/update-username', authenticate, updateUsername);

router.get('/admin/questions',authenticate,isAdmin, getAllQuestions);
router.post('/admin/questions',authenticate, isAdmin, createQuestion);
router.put('/admin/questions/:id',authenticate, isAdmin, updateQuestion);
router.delete('/admin/questions/:id',authenticate, isAdmin, deleteQuestion);

router.post('/tests/start', authenticate, startTest);
router.post('/tests/finish', authenticate, finishTest);
router.get('/admin/tests', authenticate, isAdmin, getAllTests);
router.post('/wrong-answers', authenticate, recordWrongAnswer);
router.post('/user-answers', authenticate, recordUserAnswer);

export default router;