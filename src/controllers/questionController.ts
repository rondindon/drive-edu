import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
