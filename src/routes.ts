// src/routes.ts
import { Router } from 'express';
import { handleNewUser } from './controllers/userController';
import { createQuestion, isAdmin } from './controllers/adminController';

const router: Router = Router();

router.post('/user', handleNewUser);
router.post('/admin/questions', isAdmin, createQuestion);

export default router;