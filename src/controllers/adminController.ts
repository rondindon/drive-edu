// src/controllers/adminController.ts
import { Request, Response,NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

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
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const getAllQuestions = async (req: Request, res: Response) => {
  try {
    const {
      limit = 100,
      offset = 0,
      category,
      difficulty
    } = req.query;

    const whereClause: any = {};

    if (category && category !== 'All') {
      whereClause.category = category;
    }
    if (difficulty && difficulty !== 'All') {
      whereClause.difficulty = difficulty;
    }

    const questions = await prisma.question.findMany({
      where: whereClause,
      orderBy: { id: 'asc' },
      take: Number(limit),
      skip: Number(offset),
    });
    return res.json(questions);
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
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
  } = req.body;

  try {
    const question = await prisma.question.update({
      where: { id: Number(id) },
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
    return res.json({ message: 'Question updated successfully', question });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.question.delete({ where: { id: Number(id) } });
    return res.json({ message: 'Question deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};