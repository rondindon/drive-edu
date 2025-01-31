import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Get a single question by ID
export const getQuestionById = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    const question = await prisma.question.findUnique({
      where: { id: Number(id) }, // Ensure the ID is treated as an integer
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    return res.status(200).json(question);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getRoadSigns = async (req: Request, res: Response): Promise<Response> => {
  try {
    const questions = await prisma.question.findMany({
      where: {
        category: "Dopravné značky a dopravné zariadenia",
        imageUrl: {
          not: null,
        },
      },
    });

    if (questions.length === 0) {
      return res.status(404).json({ message: "No road sign questions found." });
    }

    const shuffled = shuffleArray(questions);

    return res.status(200).json(shuffled);
  } catch (error: any) {
    console.error("Error fetching road sign questions:", error);
    return res.status(500).json({ error: error.message });
  }
};