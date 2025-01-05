import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';

const prisma = new PrismaClient();

// The categories you listed, each with how many questions to pick
const categoriesConfig = [
  { category: 'Pravidlá cestnej premávky', count: 8 },
  { category: 'Uplatňovanie pravidiel prednosti v jazde a rýchlostné obmedzenia', count: 2 },
  { category: 'Dopravné značky a dopravné zariadenia', count: 8 },
  { category: 'Dopravné situácie na križovatkách', count: 4 },
  { category: 'Všeobecné pravidlá správania sa v prípade dopravnej nehody', count: 1 },
  { category: 'Teória vedenia vozidla', count: 3 },
  { category: 'Predpisy týkajúce sa dokladov požadovaných v prípade používania vozidla a organizácia času v doprave', count: 2 },
  { category: 'Podmienky prevádzky vozidiel v premávke na pozemných komunikáciách', count: 2 },
  { category: 'Zásady bezpečnej jazdy', count: 8 },
  { category: 'Konštrukcia vozidiel a ich údržba', count: 2 },
];

const letterMap = ['A', 'B', 'C']; // Extend if you might have more than 4-5 options

// Helper: Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  export async function startTest(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { group } = req.body;
  
      if (!userId) {
        console.log('[startTest] ERROR: No user ID.');
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (!group) {
        console.log('[startTest] ERROR: No group provided.');
        return res.status(400).json({ message: 'Group is required' });
      }
  
      console.log(`[startTest] START | userId=${userId}, group=${group}`);
  
      let finalQuestions: any[] = [];
  
      // For each category
      for (const cat of categoriesConfig) {
        console.log(`[startTest] Category: "${cat.category}" => fetch from DB...`);
        
        // 1) Fetch ALL questions (good + bad) for the category
        const allCategoryQuestions = await prisma.question.findMany({
          where: {
            category: cat.category,
            groups: {
              has: group,
            },
          },
          include: {
            wrongAnswers: true,
          },
        });
  
        const totalFound = allCategoryQuestions.length;
        console.log(`   Found ${totalFound} questions in DB for "${cat.category}".`);
  
        if (totalFound === 0) {
          console.log(`   Skipping "${cat.category}" because no questions found.`);
          continue;
        }
  
        // 2) Shuffle the entire array (pure random)
        const shuffledAll = shuffleArray(allCategoryQuestions);
  
        // 3) Take the top 'cat.count' => randomPick
        let randomPick = shuffledAll.slice(0, cat.count);
  
        console.log(`   After shuffle, randomPick has ${randomPick.length} items.`);
  
        // 4) Identify "bad" questions (totalWrong > 0)
        //    We'll try to insert them by replacing random items in randomPick
        const badQuestions = shuffledAll.filter((q) => {
          const totalWrong = q.wrongAnswers.reduce((acc, wa) => acc + wa.attempts, 0);
          return totalWrong > 0;
        });
  
        console.log(`   Among the ${totalFound} total, found ${badQuestions.length} 'bad' Qs.`);
  
        // Shuffle the badQ so the insertion is random
        shuffleArray(badQuestions);
  
        for (const bq of badQuestions) {
          // If randomPick already has it (by ID), skip
          if (randomPick.some((item) => item.id === bq.id)) {
            // console.log(`     [skip] badQ ID=${bq.id} is already in randomPick`);
            continue;
          }
          // Replace a random item in randomPick with this bad Q
          const randIndex = Math.floor(Math.random() * randomPick.length);
          console.log(`     Replacing item in randomPick idx=${randIndex} with badQ ID=${bq.id}`);
          randomPick[randIndex] = bq;
        }
  
        // Now we have cat.count final for this category
        console.log(`   Final pick for "${cat.category}" => ${randomPick.length} Qs.`);
  
        finalQuestions = [...finalQuestions, ...randomPick];
      }
  
      const totalSelected = finalQuestions.length;
      console.log(`[startTest] Combined total after all categories = ${totalSelected} questions.`);
  
      // Optional: shuffle the entire final array of 40 if you want them in random order across categories
      // finalQuestions = shuffleArray(finalQuestions);
  
      // === Randomize each question's options & re-map correctAnswer
      const randomizedQuestions = finalQuestions.map((q) => {
        // We assume q.correctAnswer is letter-based ("A", "B", "C", etc.)
        const oldLetterIndex = letterMap.indexOf(q.correctAnswer);
        if (oldLetterIndex < 0) {
          console.log(`   [WARNING] Q ID=${q.id} has correctAnswer="${q.correctAnswer}", not in letterMap.`);
          return q; // fallback: no change
        }
  
        // Original correct option text
        const correctOptionText = q.options[oldLetterIndex];
  
        // Shuffle the q.options array
        const newOptions = shuffleArray(q.options);
  
        // Where did correctOptionText land?
        const newIndex = newOptions.indexOf(correctOptionText);
        const newCorrectLetter = letterMap[newIndex] ?? 'A';
  
        return {
          ...q,
          options: newOptions,
          correctAnswer: newCorrectLetter,
        };
      });
  
      // === Create a new Test record
      const newTest = await prisma.test.create({
        data: {
          userId,
          group,
          score: 0,
          totalQuestions: randomizedQuestions.length,
          timeTaken: 0,
          isPassed: false,
        },
      });
  
      console.log(`[startTest] Created Test ID=${newTest.id}. Storing testQuestion links...`);
  
      // Save to TestQuestion
      for (const q of randomizedQuestions) {
        await prisma.testQuestion.create({
          data: {
            testId: newTest.id,
            questionId: q.id,
          },
        });
      }
      console.log(`[startTest] Stored ${randomizedQuestions.length} testQuestion records for Test ID=${newTest.id}`);
  
      return res.status(200).json({
        message: 'Test started successfully',
        testId: newTest.id,
        questions: randomizedQuestions,
      });
    } catch (error) {
      console.error('[startTest] Error:', error);
      return res.status(500).json({ message: 'Error starting test' });
    }
  }

  export async function finishTest(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { testId, score, timeTaken, isPassed, userAnswers } = req.body;
  
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      if (!testId) {
        return res.status(400).json({ message: 'testId is required' });
      }
  
      // 1) Update the Test record
      const updatedTest = await prisma.test.update({
        where: { id: testId },
        data: {
          score: score || 0, 
          timeTaken: timeTaken || 0,
          isPassed: Boolean(isPassed),
        },
      });
  
      // 2) If userAnswers array is provided, upsert them in the UserAnswer table
      if (Array.isArray(userAnswers)) {
        for (const ans of userAnswers) {
          // Each ans = { questionId, selected, isCorrect }
          // Use your named unique constraint "user_question_test_unique"
          // so we can upsert on (userId, questionId, testId).
          await prisma.userAnswer.upsert({
            where: {
              user_question_test_unique: {
                userId: userId,
                questionId: ans.questionId,
                testId: testId,
              },
            },
            update: {
              selected: ans.selected,
              isCorrect: ans.isCorrect,
            },
            create: {
              userId: userId,
              questionId: ans.questionId,
              testId: testId,
              selected: ans.selected,
              isCorrect: ans.isCorrect,
            },
          });
        }
      }
  
      // 3) Return success response
      return res.json({
        message: 'Test finished!',
        test: updatedTest,
      });
    } catch (error) {
      console.error('[finishTest] Error:', error);
      return res.status(500).json({ message: 'Error finishing test', error: String(error) });
    }
  }

// In testController.ts
export async function getAllTests(req: Request, res: Response) {
    try {
      const tests = await prisma.test.findMany({
        include: {
          user: true,
        },
      });
      res.json(tests);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving tests' });
    }
  }

  export const recordWrongAnswer = async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log('[recordWrongAnswer] req.body:', req.body);
      const userId = req.user?.id;
      const { questionId } = req.body;
  
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
      }
      if (!questionId) {
        return res.status(400).json({ message: 'questionId is required.' });
      }
  
      // findUnique using named constraint "userId_questionId_unique"
      const existingRecord = await prisma.wrongAnswer.findUnique({
        where: {
          userId_questionId_unique: {
            userId,
            questionId,
          },
        },
      });
  
      if (existingRecord) {
        // update if found
        const updated = await prisma.wrongAnswer.update({
          where: {
            userId_questionId_unique: {
              userId,
              questionId,
            },
          },
          data: {
            attempts: existingRecord.attempts + 1,
          },
        });
  
        return res.status(200).json({
          message: 'Wrong answer updated successfully',
          wrongAnswer: updated,
        });
      } else {
        // create new if not found
        const created = await prisma.wrongAnswer.create({
          data: {
            userId,
            questionId,
            attempts: 1,
          },
        });
  
        return res.status(201).json({
          message: 'Wrong answer recorded successfully',
          wrongAnswer: created,
        });
      }
    } catch (error) {
      console.error('Error recording wrong answer:', error);
      return res.status(500).json({ message: 'Error recording wrong answer' });
    }
  };

  export async function recordUserAnswer(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { questionId, testId, selected, isCorrect } = req.body;
  
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
      }
      if (!questionId || selected === undefined || isCorrect === undefined) {
        return res.status(400).json({ message: 'questionId, selected, and isCorrect are required.' });
      }
  
      // Create a new UserAnswer record
      const answer = await prisma.userAnswer.create({
        data: {
          userId,
          questionId,
          testId,      // can be null or omitted if not relevant
          selected,    // e.g. "A"
          isCorrect,   // boolean
        },
      });
  
      return res.status(201).json({
        message: 'User answer recorded successfully',
        userAnswer: answer,
      });
    } catch (error) {
      console.error('Error recording user answer:', error);
      return res.status(500).json({ message: 'Error recording user answer' });
    }
  }