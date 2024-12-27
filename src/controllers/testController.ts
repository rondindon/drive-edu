import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

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

export async function startTest(req: Request, res: Response) {
  try {
    const userId = req.user?.id; 
    const { group } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!group) {
      return res.status(400).json({ message: 'Group is required' });
    }

    // Container for our final selected questions
    let selectedQuestions: any[] = [];

    // For each category, pick the required count of questions
    for (const cat of categoriesConfig) {
      // 1) Get all questions for this category that also include the chosen group
      // We'll also compute how often they've been answered wrong (globally, as an example).
      // In Prisma, we can do an aggregate on the WrongAnswer table or fetch them with includes.

      const questionsInCategory = await prisma.question.findMany({
        where: {
          category: cat.category,
          groups: {
            has: group, // means "groups" array should contain the `group` string
          },
        },
        include: {
          wrongAnswers: true, // so we can see how many times they've been answered incorrectly
        },
      });

      // 2) Calculate "totalWrongAttempts" for each question
      //    If you want user-specific weighting, filter the user's wrongAnswers instead.
      const weightedQuestions = questionsInCategory.map((q) => {
        const totalWrong = q.wrongAnswers.reduce((acc, wa) => acc + wa.attempts, 0);
        return { ...q, totalWrong };
      });

      // 3) Sort by totalWrong in descending order => the top means more frequently missed
      weightedQuestions.sort((a, b) => b.totalWrong - a.totalWrong);

      // 4) Pick the top N. 
      //    Alternatively, you might do a random pick with weighted probability if you want more variety.
      const picked = weightedQuestions.slice(0, cat.count);

      selectedQuestions = [...selectedQuestions, ...picked];
    }

    // Now we have 40 questions (8+2+8+4+1+3+2+2+8+2 = 40).
    // Create a new Test record
    const newTest = await prisma.test.create({
      data: {
        userId: userId,
        group: group,
        score: 0,
        totalQuestions: 40, // or selectedQuestions.length
        timeTaken: 0,
        isPassed: false,
      },
    });

    // Optionally, store each question in a TestQuestion table
    // (if you added that model above).
    // This way, you know exactly which questions are in this test.
    // In a real app, consider using a transaction or upsert approach.
    for (let q of selectedQuestions) {
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
      questions: selectedQuestions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error starting test' });
  }
}

// If you want an endpoint for finishing/updating the test:
export async function finishTest(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { testId, score, timeTaken, isPassed } = req.body;

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