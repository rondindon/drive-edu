import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// User registration
export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).json({ error: 'User already exists' });
  }
};

// User login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, 'your-secret-key');
  res.json({ token, user });
};

// Fetch questions based on group
export const getQuestions = async (req: Request, res: Response) => {
  const { group } = req.query;
  const questions = await prisma.question.findMany({ where: { group: String(group) } });
  res.json({ questions });
};

// Submit test and calculate score
export const submitTest = async (req: Request, res: Response) => {
  const { userId, answers } = req.body;
  // logic to calculate score and update user performance
  res.json({ message: 'Test submitted' });
};
