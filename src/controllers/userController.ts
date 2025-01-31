import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleNewUser = async (req: Request, res: Response): Promise<Response> => {
  const { email, username }: { email: string; username: string } = req.body;

  console.log('Creating new user:', email, username);

  try {
    // Check if the user already exists in the Prisma table
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      // Check if the username is already taken
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken." });
      }

      // Add the user to the Prisma User table
      const user = await prisma.user.create({
        data: {
          email,
          username, // Add username to the user creation
          role: "USER", // Assign default role
        },
      });
      return res.status(201).json({ user });
    }

    return res.status(400).json({ message: "User already exists in the database." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// New handler for GET /api/user?email=...
export const getUserByEmail = async (req: Request, res: Response): Promise<Response> => {
  const email = req.query.email as string;

  if (!email) {
    return res.status(400).json({ error: 'Email query parameter is required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Exclude sensitive fields if necessary
    const { role, username } = user;
    return res.status(200).json({ role, username });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateUsername = async (req: Request, res: Response) => {
  const { email, newUsername } = req.body;

  if (!email || !newUsername) {
    return res.status(400).json({ message: 'Email and new username are required' });
  }

  try {
    console.log('Updating username for email:', email);

    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { username: newUsername },
    });

    return res.status(200).json({ message: 'Username updated successfully', updatedUser });
  } catch (error: any) {
    if (error.code === 'P2025') {
      // Prisma error for record not found
      return res.status(404).json({ message: 'User not found' });
    }

    console.error(error);
    return res.status(500).json({ message: 'Failed to update username' });
  }
};