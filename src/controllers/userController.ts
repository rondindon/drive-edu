// src/controllers/userController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleNewUser = async (req: Request, res: Response): Promise<Response> => {
  const { email }: { email: string } = req.body;

  try {
    // Check if the user already exists in the Prisma table
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      // Add the user to the Prisma User table
      const user = await prisma.user.create({
        data: {
          email,
          role: 'USER', // Assign default role
        },
      });
      return res.status(201).json({ user });
    }

    return res.status(400).json({ message: 'User already exists in the database.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};