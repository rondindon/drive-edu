// src/routes.ts
import { Router } from 'express';
import { getUserByEmail, handleNewUser, updateUsername } from './controllers/userController';
import { createQuestion, deleteQuestion, getAllQuestions, isAdmin, updateQuestion } from './controllers/adminController';
import { getQuestionById } from './controllers/questionController';
import { authenticate } from './middleware/auth';
import { deleteUser, getAllUsers, updateUser } from './controllers/adminUserController';
import {deleteTest, finishTest, getAllTests, getUserTests, recordQuestionStat, recordUserAnswer, startTest } from './controllers/testController';
import { createReport, deleteReport, getAllReports, markReportResolved, markReportReviewed } from './controllers/reportController';
import { getAdminTestStats, getAnswerStats, getBadgeStats, getTestStats, getWorstAccuracyQuestions, testsTakenAndPassedByUser } from './controllers/statsController';

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
router.get('/user/tests', authenticate, getUserTests);
router.post('/question-stats', authenticate, recordQuestionStat);
router.post('/user-answers', authenticate, recordUserAnswer);
//ADMIN
router.get('/admin/tests', authenticate, isAdmin, getAllTests);
router.delete("/admin/tests/:id", authenticate, isAdmin, deleteTest);

router.post('/report', authenticate, createReport);
router.get('/admin/report', authenticate, isAdmin, getAllReports);
router.post('/admin/reports/:id/review', authenticate, isAdmin, markReportReviewed);
router.post('/admin/reports/:id/resolve', authenticate, isAdmin, markReportResolved);
router.delete('/admin/reports/:id/delete', authenticate, isAdmin, deleteReport);

router.get('/user/stats/tests', authenticate, getTestStats);
router.get('/user/stats/answers', authenticate, getAnswerStats);
router.get('/user/stats/badges', authenticate, getBadgeStats);
router.get('/user/stats/worst-accuracy', authenticate, getWorstAccuracyQuestions);
router.get('/user/stats/test-summary', authenticate, testsTakenAndPassedByUser);
router.get('/admin/stats/tests', authenticate, isAdmin, getAdminTestStats);

export default router;