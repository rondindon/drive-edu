"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestStats = getTestStats;
exports.getAnswerStats = getAnswerStats;
exports.getBadgeStats = getBadgeStats;
exports.getWorstAccuracyQuestions = getWorstAccuracyQuestions;
exports.testsTakenAndPassedByUser = testsTakenAndPassedByUser;
exports.getAdminTestStats = getAdminTestStats;
exports.getUserStreak = getUserStreak;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getTestStats(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        // Fetch all tests for the user
        const tests = await prisma.test.findMany({
            where: { userId },
            select: { createdAt: true, score: true, isPassed: true }, // Adjust based on your schema
            orderBy: { createdAt: 'asc' },
        });
        // Group tests by day
        const testsByDayMap = {};
        tests.forEach((test) => {
            const day = test.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
            testsByDayMap[day] = (testsByDayMap[day] || 0) + 1;
        });
        const testsOverTimeDay = Object.keys(testsByDayMap)
            .sort()
            .map((day) => ({
            period: day,
            count: testsByDayMap[day],
        }));
        // Group tests by month
        const testsByMonthMap = {};
        tests.forEach((test) => {
            const month = `${test.createdAt.getFullYear()}-${(test.createdAt.getMonth() + 1)
                .toString()
                .padStart(2, '0')}`; // Format: YYYY-MM
            testsByMonthMap[month] = (testsByMonthMap[month] || 0) + 1;
        });
        const testsOverTimeMonth = Object.keys(testsByMonthMap)
            .sort()
            .map((month) => ({
            period: month,
            count: testsByMonthMap[month],
        }));
        // Calculate average score
        const averageScore = tests.length > 0 ? tests.reduce((acc, test) => acc + test.score, 0) / tests.length : null;
        // Calculate pass rate
        const passRate = tests.length > 0 ? (tests.filter((test) => test.isPassed).length / tests.length) * 100 : null;
        return res.status(200).json({
            testsOverTimeDay,
            testsOverTimeMonth,
            averageScore,
            passRate,
        });
    }
    catch (error) {
        console.error('[getTestStatsCombined] Error:', error);
        return res.status(500).json({ message: 'Error fetching combined test statistics' });
    }
}
/**
 * Get Answer Statistics for the authenticated user
 * - Correct vs. Wrong answers
 * - Performance by category
 */
async function getAnswerStats(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        // Fetch all user answers
        const userAnswers = await prisma.userAnswer.findMany({
            where: { userId },
            include: {
                question: {
                    select: {
                        category: true,
                    },
                },
            },
        });
        if (userAnswers.length === 0) {
            return res
                .status(200)
                .json({ message: 'No answer data available', answerStats: null });
        }
        // Calculate correct vs wrong
        const correctCount = userAnswers.filter((ua) => ua.isCorrect).length;
        const wrongCount = userAnswers.length - correctCount;
        // Calculate performance by category
        const performanceByCategoryMap = {};
        userAnswers.forEach((ua) => {
            const category = ua.question.category || 'Uncategorized';
            if (!performanceByCategoryMap[category]) {
                performanceByCategoryMap[category] = { correct: 0, total: 0 };
            }
            if (ua.isCorrect) {
                performanceByCategoryMap[category].correct += 1;
            }
            performanceByCategoryMap[category].total += 1;
        });
        const performanceByCategory = Object.keys(performanceByCategoryMap).map((category) => ({
            category,
            correct: performanceByCategoryMap[category].correct,
            total: performanceByCategoryMap[category].total,
            accuracy: parseFloat(((performanceByCategoryMap[category].correct /
                performanceByCategoryMap[category].total) *
                100).toFixed(2)),
        }));
        return res.status(200).json({
            correctCount,
            wrongCount,
            performanceByCategory,
        });
    }
    catch (error) {
        console.error('[getAnswerStats] Error:', error);
        return res.status(500).json({ message: 'Error fetching answer statistics' });
    }
}
async function getBadgeStats(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        // Fetch all badges for the user
        const badges = await prisma.badge.findMany({
            where: { userId },
            select: {
                title: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        const answeredQuestions = await prisma.userAnswer.count({
            where: { userId },
        });
        const completedTests = await prisma.test.count({
            where: { userId },
        });
        // Process badges over time (e.g., monthly)
        const badgesOverTimeMap = {};
        badges.forEach((badge) => {
            const month = `${badge.createdAt.getFullYear()}-${(badge.createdAt.getMonth() + 1)
                .toString()
                .padStart(2, '0')}`; // Format: YYYY-MM
            badgesOverTimeMap[month] = (badgesOverTimeMap[month] || 0) + 1;
        });
        const badgesOverTime = Object.keys(badgesOverTimeMap)
            .sort()
            .map((month) => ({
            month,
            count: badgesOverTimeMap[month],
        }));
        return res.status(200).json({
            badges,
            badgesOverTime,
            answeredQuestions,
            completedTests,
        });
    }
    catch (error) {
        console.error('[getBadgeStats] Error:', error);
        return res.status(500).json({ message: 'Error fetching badge statistics' });
    }
}
async function getWorstAccuracyQuestions(req, res) {
    try {
        // **Authentication:**
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
        }
        // **Fetch QuestionStat Records with Related Questions:**
        const questionStats = await prisma.questionStat.findMany({
            where: { userId },
            include: {
                question: true, // Include related question
            },
        });
        if (questionStats.length === 0) {
            return res.status(200).json({ message: 'No question statistics available.' });
        }
        // **Calculate Accuracy and Prepare Data:**
        const worstAccuracyQuestions = questionStats
            .map(stat => {
            const totalAttempts = stat.correctCount + stat.wrongCount;
            const accuracy = totalAttempts > 0 ? (stat.correctCount / totalAttempts) * 100 : 0;
            return {
                questionId: stat.questionId,
                questionText: stat.question.text,
                imageUrl: stat.question.imageUrl ?? undefined,
                correctCount: stat.correctCount,
                wrongCount: stat.wrongCount,
                accuracy: parseFloat(accuracy.toFixed(2)),
                options: stat.question.options,
                correctAnswer: stat.question.correctAnswer,
            };
        })
            // **Sort by Ascending Accuracy and Descending WrongCount:**
            .sort((a, b) => {
            if (a.accuracy === b.accuracy) {
                return b.wrongCount - a.wrongCount; // More wrong answers come first
            }
            return a.accuracy - b.accuracy; // Lower accuracy comes first
        })
            // **Limit to Top N (e.g., Top 10 Worst):**
            .slice(0, 10);
        return res.status(200).json({ worstAccuracyQuestions });
    }
    catch (error) {
        console.error('[getWorstAccuracyQuestions] Error:', error);
        return res.status(500).json({ message: 'Internal Server Error: Unable to fetch worst accuracy questions.' });
    }
}
async function testsTakenAndPassedByUser(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
        }
        // **Fetch All Tests for the User:**
        const tests = await prisma.test.findMany({
            where: { userId },
            select: { isPassed: true },
        });
        if (tests.length === 0) {
            return res.status(200).json({ testsTaken: 0, testsPassed: 0 });
        }
        const testsTaken = tests.length;
        const testsPassed = tests.filter(test => test.isPassed).length;
        return res.status(200).json({ testsTaken, testsPassed });
    }
    catch (error) {
        console.error('[testsTakenAndPassedByUser] Error:', error);
        return res.status(500).json({ message: 'Internal Server Error: Unable to fetch tests taken and passed.' });
    }
}
;
async function getAdminTestStats(req, res) {
    try {
        // Fetch all tests
        const tests = await prisma.test.findMany({
            select: { createdAt: true, score: true, isPassed: true }, // Adjust based on your schema
            orderBy: { createdAt: 'asc' },
        });
        // Group tests by month
        const testsByMonthMap = {};
        tests.forEach((test) => {
            const month = `${test.createdAt.getFullYear()}-${(test.createdAt.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM
            if (!testsByMonthMap[month]) {
                testsByMonthMap[month] = { count: 0, totalScore: 0, passed: 0 };
            }
            testsByMonthMap[month].count += 1;
            testsByMonthMap[month].totalScore += test.score;
            if (test.isPassed) {
                testsByMonthMap[month].passed += 1;
            }
        });
        const testsOverTimeMonth = Object.keys(testsByMonthMap)
            .sort()
            .map((month) => ({
            period: month,
            count: testsByMonthMap[month].count,
        }));
        const testPerformanceByMonth = Object.keys(testsByMonthMap)
            .sort()
            .map((month) => ({
            period: month,
            averageScore: parseFloat((testsByMonthMap[month].totalScore / testsByMonthMap[month].count).toFixed(2)),
            passRate: parseFloat(((testsByMonthMap[month].passed / testsByMonthMap[month].count) * 100).toFixed(2)),
        }));
        return res.status(200).json({
            testsOverTimeMonth,
            testPerformanceByMonth,
        });
    }
    catch (error) {
        console.error('[getAdminTestStats] Error:', error);
        return res.status(500).json({ message: 'Error fetching admin test statistics' });
    }
}
async function getUserStreak(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
        }
        // Get today's date at midnight
        const today = new Date();
        //convert to slovakian time
        today.setHours(today.getHours() + 2);
        // Fetch all tests (both passed and failed) for the user, ordered descending by createdAt
        const completedTests = await prisma.test.findMany({
            where: {
                userId,
            },
            select: {
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        // Extract unique days with at least one completed test
        const completedDaysSet = new Set();
        completedTests.forEach(test => {
            const day = test.createdAt.toISOString().split('T')[0]; // 'YYYY-MM-DD'
            completedDaysSet.add(day);
        });
        let streak = 0;
        let currentDate = new Date(today);
        while (true) {
            const dayStr = currentDate.toISOString().split('T')[0];
            if (completedDaysSet.has(dayStr)) {
                streak += 1;
                // Move to previous day
                currentDate.setDate(currentDate.getDate() - 1);
            }
            else {
                break;
            }
        }
        return res.status(200).json({ streak });
    }
    catch (error) {
        console.error('[getUserStreak] Error:', error);
        return res.status(500).json({ message: 'Internal Server Error: Unable to calculate streak.' });
    }
}
