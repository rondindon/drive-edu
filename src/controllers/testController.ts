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
  function pickWeighted<T extends { weight: number }>(
    items: T[],
    count: number
  ): T[] {
    // We’ll do a simple approach:
    // For i in [1..count]:
    //   sum all weights
    //   pick random in [0..sum]
    //   find item => push to result, remove from array
    const result: T[] = [];
    const available = [...items];
  
    for (let i = 0; i < count && available.length > 0; i++) {
      // Compute total weight
      let totalWeight = 0;
      for (const item of available) {
        totalWeight += item.weight;
      }
      if (totalWeight <= 0) {
        // Means all items have weight=0, or no more "bad" ones. Stop.
        break;
      }
  
      const r = Math.random() * totalWeight;
      let cumulative = 0;
      let chosenIndex = 0;
  
      for (let idx = 0; idx < available.length; idx++) {
        cumulative += available[idx].weight;
        if (cumulative >= r) {
          chosenIndex = idx;
          break;
        }
      }
  
      // pick item
      const picked = available.splice(chosenIndex, 1)[0];
      result.push(picked);
    }
  
    return result;
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
  
      console.log(`[startTest] userId=${userId}, group=${group}`);
  
      let finalQuestions: any[] = [];
  
      for (const cat of categoriesConfig) {
        // 1) Normal random subset from DB
        const normalPick = await prisma.$queryRawUnsafe<any[]>(`
          SELECT *
          FROM "Question"
          WHERE "category" = '${cat.category}'
            AND '${group}' = ANY("groups")
          ORDER BY RANDOM()
          LIMIT ${cat.count}
        `);
  
        if (!normalPick || normalPick.length === 0) {
          console.log(`category="${cat.category}" => no normalPick found. Skipping.`);
          continue;
        }
  
        // 2) "Bad" subset logic (top 10 worst by ratio), etc.
        const maxBadCandidates = 10;
        const possibleBad = await prisma.$queryRawUnsafe<any[]>(`
          SELECT q.*,
            (CASE WHEN (COALESCE(s."correctCount",0) + COALESCE(s."wrongCount",0))=0 
                  THEN 0
                  ELSE (COALESCE(s."wrongCount",0)*1.0 / (s."correctCount" + s."wrongCount")) 
            END) AS ratio,
            COALESCE(s."wrongCount",0) AS "wCount",
            COALESCE(s."correctCount",0) AS "cCount"
          FROM "Question" q
          LEFT JOIN "QuestionStat" s ON s."questionId" = q."id" AND s."userId" = ${userId}
          WHERE q."category" = '${cat.category}'
            AND '${group}' = ANY(q."groups")
          ORDER BY ratio DESC
          LIMIT ${maxBadCandidates};
        `);
  
        // Weighted items
        const badCandidates = possibleBad
          .map((row) => {
            const total = Number(row.cCount) + Number(row.wCount);
            if (total === 0) return null;
            const ratio = Number(row.ratio);
            if (ratio <= 0) return null;
            const weight = ratio * Math.log(total + 1);
            return { question: row, weight };
          })
          .filter(Boolean) as { question: any; weight: number }[];
  
        // Randomly decide how many to inject (0,1,2) with 50% chance for 0, etc.
        let howManyToInject = 0;
        const roll = Math.random();
        if (roll < 0.5) {
          howManyToInject = 0;
        } else if (roll < 0.75) {
          howManyToInject = 1;
        } else {
          howManyToInject = 2;
        }
  
        // Also respect 50% of cat.count
        const limitPercent = Math.floor(cat.count * 0.5);
        howManyToInject = Math.min(howManyToInject, limitPercent, badCandidates.length);
  
        if (howManyToInject > 0) {
          const pickedBad = pickWeighted(badCandidates, howManyToInject);
          for (const badObj of pickedBad) {
            const bq = badObj.question;
            if (normalPick.some((x) => x.id === bq.id)) continue;
            const randIndex = Math.floor(Math.random() * normalPick.length);
            normalPick[randIndex] = bq;
          }
        }
  
        finalQuestions.push(...normalPick);
      }
  
      // randomize each question's options
      const randomizedQuestions = finalQuestions.map((q) => {
        const oldIndex = letterMap.indexOf(q.correctAnswer);
        if (oldIndex < 0) return q;
        const correctText = q.options[oldIndex];
        const newOpts = shuffleArray([...q.options]);
        const newIndex = newOpts.indexOf(correctText);
        const newCorrectLetter = letterMap[newIndex] || 'A';
  
        return {
          ...q,
          options: newOpts,
          correctAnswer: newCorrectLetter,
        };
      });
  
      // Create the Test record
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
  
      // **STEP 1**: Return an immediate response so the client can load
      // the test page right away, with "questions" data
      res.status(200).json({
        message: 'Test started successfully',
        testId: newTest.id,
        questions: randomizedQuestions,
      });
      setImmediate(async () => {
        try {
          await prisma.testQuestion.createMany({
            data: randomizedQuestions.map((qq) => ({
              testId: newTest.id,
              questionId: qq.id,
            })),
          });
          console.log(`[startTest background] Inserted ${randomizedQuestions.length} testQuestion rows`);
        } catch (bgErr) {
          console.error('[startTest background insert] error:', bgErr);
          // You might handle retries, logging, etc. here
        }
      });
  
    } catch (err) {
      console.error('[startTest] Error:', err);
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

    // If no userAnswers provided, just return
    if (!Array.isArray(userAnswers) || userAnswers.length === 0) {
      return res.json({
        message: 'Test finished (no userAnswers to store)',
        test: updatedTest,
      });
    }

    // 2) Find which userAnswers already exist
    //    We have a unique constraint on (userId, testId, questionId).
    const questionIds = userAnswers.map((ua) => ua.questionId);
    const existingRecords = await prisma.userAnswer.findMany({
      where: {
        userId,
        testId,
        questionId: { in: questionIds },
      },
    });
    // Map existing questionIds -> userAnswer record
    const existingMap = new Map<number, typeof existingRecords[number]>();
    for (const rec of existingRecords) {
      existingMap.set(rec.questionId, rec);
    }

    // 3) Separate new vs. existing
    const newAnswers = [];
    const updateAnswers = [];
    for (const ans of userAnswers) {
      const existing = existingMap.get(ans.questionId);
      if (existing) {
        // We'll need to update
        updateAnswers.push(ans);
      } else {
        // We'll need to create
        newAnswers.push(ans);
      }
    }

    // 4) Create all "new" records at once using createMany
    //    (If none are new, skip)
    if (newAnswers.length > 0) {
      // createMany in a single query
      await prisma.userAnswer.createMany({
        data: newAnswers.map((ans) => ({
          userId,
          testId,
          questionId: ans.questionId,
          selected: ans.selected,
          isCorrect: ans.isCorrect,
        })),
      });
    }

    // 5) Update all "existing" records in a single transaction
    //    (One .update call per record, but at least it's inside one transaction.)
    if (updateAnswers.length > 0) {
      await prisma.$transaction(
        updateAnswers.map((ans) =>
          prisma.userAnswer.update({
            where: {
              user_question_test_unique: {
                userId,
                questionId: ans.questionId,
                testId,
              },
            },
            data: {
              selected: ans.selected,
              isCorrect: ans.isCorrect,
            },
          })
        )
      );
    }

    // 6) Return success response
    return res.json({
      message: 'Test finished!',
      test: updatedTest,
      createdCount: newAnswers.length,
      updatedCount: updateAnswers.length,
    });
  } catch (error) {
    console.error('[finishTest] Error:', error);
    return res
      .status(500)
      .json({ message: 'Error finishing test', error: String(error) });
  }
}

  export async function recordQuestionStat(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { questionId, isCorrect } = req.body;
  
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (!questionId || typeof isCorrect !== 'boolean') {
        return res.status(400).json({ message: 'questionId and isCorrect are required' });
      }
  
      // Attempt to find existing record
      const existing = await prisma.questionStat.findUnique({
        where: {
          user_question_unique: {
            userId,
            questionId,
          },
        },
      });
  
      if (existing) {
        // Update existing
        const updated = await prisma.questionStat.update({
          where: {
            user_question_unique: {
              userId,
              questionId,
            },
          },
          data: isCorrect
            ? { correctCount: existing.correctCount + 1 }
            : { wrongCount: existing.wrongCount + 1 },
        });
        return res.status(200).json({ message: 'QuestionStat updated', questionStat: updated });
      } else {
        // Create new
        const created = await prisma.questionStat.create({
          data: {
            userId,
            questionId,
            correctCount: isCorrect ? 1 : 0,
            wrongCount: isCorrect ? 0 : 1,
          },
        });
        return res.status(201).json({ message: 'QuestionStat created', questionStat: created });
      }
    } catch (error) {
      console.error('[recordQuestionStat] Error:', error);
      return res.status(500).json({ message: 'Error recording question stat' });
    }
  }

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

// ADMIN
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

export async function deleteTest(req: Request, res: Response) {
const { id } = req.params;

try {
  const deletedTest = await prisma.test.delete({
    where: { id: parseInt(id, 10) },
  });
  res.json(deletedTest);
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Error deleting test' });
}
}

export async function getUserTests(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Fetch all tests belonging to this user.
    const tests = await prisma.test.findMany({
      where: { userId },
      include: {
        user: true
      },
    });

    console.log(tests);

    return res.status(200).json(tests);
  } catch (error) {
    console.error('[getUserTests] Error:', error);
    return res.status(500).json({ message: 'Error retrieving user tests' });
  }
}