// src/controllers/adminController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware to check if the user is an admin
export const isAdmin = (req: Request, res: Response, next: Function) => {
  const userRole = req.body.role;
  if (userRole !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

// Create a new question
export const createQuestion = async (req: Request, res: Response): Promise<Response> => {
  const {
    groups,
    category,
    text,
    options,
    correctAnswer,
    imageUrl,
    difficulty,
    explanation,
    points,
  }: {
    groups: string[];
    category: string;
    text: string;
    options: string[];
    correctAnswer: string;
    imageUrl?: string;
    difficulty: string;
    explanation: string;
    points: number;
  } = req.body;

  // Ensure only 3 options (A, B, C) are provided and valid
  if (options.length !== 3 || !['A', 'B', 'C'].includes(correctAnswer)) {
    return res.status(400).json({ message: 'Options must be A, B, C, and only one can be correct.' });
  }

  try {
    const question = await prisma.question.create({
      data: {
        groups,
        category,
        text,
        options,
        correctAnswer,
        imageUrl,
        difficulty,
        explanation,
        points,
      },
    });
    return res.status(201).json({ message: 'Question created successfully', question });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};