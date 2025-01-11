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
        // Load all questions for that category
        const allCategoryQuestions = await prisma.question.findMany({
          where: {
            category: cat.category,
            groups: { has: group },
          },
          include: {
            questionStats: {
              where: { userId }, // user-specific stats only
            },
          },
        });
  
        const totalFound = allCategoryQuestions.length;
        if (totalFound === 0) {
          console.log(`   Category="${cat.category}": no questions found. Skipping.`);
          continue;
        }
  
        // Shuffle everything
        const shuffledAll = shuffleArray(allCategoryQuestions);
  
        // Normal random pick => first cat.count
        let randomPick = shuffledAll.slice(0, cat.count);
  
        // Identify "bad" candidates => ratio>0
        // We'll define weight = ratio * log(totalAttempts+1)
        // ratio = wrongCount / total
        // total = correctCount + wrongCount
        // If total=0 => never answered => ratio=0 => weight=0
        const badCandidates = allCategoryQuestions
          .map((q) => {
            const stat = q.questionStats[0];
            const correctCount = stat?.correctCount ?? 0;
            const wrongCount = stat?.wrongCount ?? 0;
            const total = correctCount + wrongCount;
            if (total === 0) {
              return null; // ratio=0 => not "bad"
            }
            const ratio = wrongCount / total;
            if (ratio <= 0) {
              return null;
            }
            // Weighted approach
            const weight = ratio * Math.log(total + 1); // e.g. ratio * ln(total+1)
            return { question: q, weight };
          })
          .filter((obj) => obj !== null) as { question: any; weight: number }[];
        
        console.log(`   Category="${cat.category}": totalFound=${totalFound}, badCandidates=${badCandidates.length}`);
        // We only want to pick up to 2 or, say, 30% of cat.count, whichever is smaller
        const maxBadAbsolute = 2; // limit of 2
        const maxBadPercent = Math.floor(cat.count * 0.2); 
        const maxBadToInject = Math.min(maxBadAbsolute, maxBadPercent, badCandidates.length);
  
        // Weighted random pick from these badCandidates
        if (maxBadToInject > 0) {
          const pickedBad = pickWeighted(badCandidates, maxBadToInject);
          console.log(`   Category="${cat.category}": Injecting ${pickedBad.length} bad questions`);
  
          // Now replace random items in randomPick
          for (const badObj of pickedBad) {
            const bq = badObj.question;
            // skip if randomPick already has it
            if (randomPick.some((x) => x.id === bq.id)) continue;
            // replace random item
            const randIndex = Math.floor(Math.random() * randomPick.length);
            randomPick[randIndex] = bq;
          }
        }
  
        finalQuestions.push(...randomPick);
      }
  
      const totalSelected = finalQuestions.length;
      console.log(`[startTest] totalSelected=${totalSelected}`);
  
      // Optionally shuffle finalQuestions across categories
      // shuffleArray(finalQuestions);
  
      // Randomize each question’s options
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
  
      // Create the Test
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
  
      // Insert testQuestion
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