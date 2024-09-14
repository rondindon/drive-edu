import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware to check if the user is an admin
export const isAdmin = (req: Request, res: Response, next: Function) => {
  const userRole = req.body.role; // Assuming role is sent from the frontend
  if (userRole !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

// Create a new question
export const createQuestion = async (req: Request, res: Response): Promise<Response> => {
  const { group, category, text, options, correctAnswer, imageUrl, difficulty, explanation } = req.body;

  try {
    const question = await prisma.question.create({
      data: {
        group,
        category,
        text,
        options,
        correctAnswer,
        imageUrl,
        difficulty,
        explanation
      },
    });
    return res.status(201).json({ message: 'Question created successfully', question });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
