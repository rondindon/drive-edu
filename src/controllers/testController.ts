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
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (!group) {
        return res.status(400).json({ message: 'Group is required' });
      }
  
      let finalQuestions: any[] = [];
  
      // 1) For each category
      for (const cat of categoriesConfig) {
        // Fetch all Qs for that category + group
        const questionsInCategory = await prisma.question.findMany({
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
  
        // If no questions in this category, skip (or handle error)
        if (!questionsInCategory.length) continue;
  
        // 2) Separate into "bad" vs "good"
        const badQuestions: any[] = [];
        const goodQuestions: any[] = [];
  
        for (const q of questionsInCategory) {
          const totalWrong = q.wrongAnswers.reduce((acc, wa) => acc + wa.attempts, 0);
          // Adjust threshold as you like. Here, we say "bad" = totalWrong > 0
          // or you might do totalWrong >= 3, etc.
          if (totalWrong > 0) {
            badQuestions.push({ ...q, totalWrong });
          } else {
            goodQuestions.push({ ...q, totalWrong });
          }
        }
  
        // 3) Randomize "goodQuestions" + pick cat.count from them
        shuffleArray(goodQuestions);
        let randomPick = goodQuestions.slice(0, cat.count);
  
        // 4) Insert some "badQuestions" by replacing random picks
        // Shuffle badQuestions so the replacement is random
        shuffleArray(badQuestions);
  
        // We'll replace as many random picks as we can (or want).
        // For each badQuestion, if it's not already in randomPick, replace a random item
        for (const badQ of badQuestions) {
          // If randomPick already includes badQ (by ID), skip
          if (randomPick.some((item) => item.id === badQ.id)) {
            continue;
          }
          // Replace a random index in randomPick
          const randIndex = Math.floor(Math.random() * randomPick.length);
          randomPick[randIndex] = badQ; 
        }
  
        // Now we have cat.count final for this category in randomPick
        finalQuestions = [...finalQuestions, ...randomPick];
      }
  
      // We now have 40 questions total (assuming your categories sum to 40).
      // If you'd like to shuffle the entire 40, do so here:
      // finalQuestions = shuffleArray(finalQuestions);
  
      // === 5) Randomize each question's options and remap correctAnswer
      const randomizedQuestions = finalQuestions.map((q) => {
        // If correctAnswer is a letter, find the index in letterMap
        const oldLetterIndex = letterMap.indexOf(q.correctAnswer);
        if (oldLetterIndex < 0) {
          // If not found, default to no changes or handle text-based
          return q;
        }
  
        // Original correct option text
        const correctOptionText = q.options[oldLetterIndex];
  
        // Shuffle the options array
        const newOptions = shuffleArray(q.options);
  
        // Find new index of correctOptionText
        const newIndex = newOptions.indexOf(correctOptionText);
        const newCorrectLetter = letterMap[newIndex] ?? 'A';
  
        return {
          ...q,
          options: newOptions,
          correctAnswer: newCorrectLetter,
        };
      });
  
      // 6) Create a new Test record
      const newTest = await prisma.test.create({
        data: {
          userId,
          group,
          score: 0,
          totalQuestions: 40, // or randomizedQuestions.length
          timeTaken: 0,
          isPassed: false,
        },
      });
  
      // 7) Optionally store in TestQuestion
      for (const q of randomizedQuestions) {
        await prisma.testQuestion.create({
          data: {
            testId: newTest.id,
            questionId: q.id,
          },
        });
      }
  
      return res.status(200).json({
        message: 'Test started successfully',
        testId: newTest.id,
        questions: randomizedQuestions,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error starting test' });
    }
  }

// If you want an endpoint for finishing/updating the test:
export async function finishTest(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { testId, score, timeTaken, isPassed } = req.body;
    console.log(req.body);

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // update the test
    const updated = await prisma.test.update({
      where: { id: testId },
      data: {
        score,
        timeTaken,
        isPassed,
      },
    });

    return res.json({
      message: 'Test finished!',
      test: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error finishing test' });
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