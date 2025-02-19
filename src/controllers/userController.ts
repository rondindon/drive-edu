import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';

const prisma = new PrismaClient();

export const handleNewUser = async (req: Request, res: Response): Promise<Response> => {
  const { email, username }: { email: string; username: string } = req.body;

  console.log('Creating new user:', email, username);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken." });
      }

      const user = await prisma.user.create({
        data: {
          email,
          username,
          role: "USER",
        },
      });
      return res.status(201).json({ user });
    }

    return res.status(400).json({ message: "User already exists in the database." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

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
      return res.status(404).json({ message: 'User not found' });
    }

    console.error(error);
    return res.status(500).json({ message: 'Failed to update username' });
  }
};

export async function updateProfilePicture(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const { profilePicture } = req.body;

    if (typeof profilePicture === 'undefined') {
      return res.status(400).json({ message: 'No profile picture provided' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileImg: profilePicture,
      },
    });

    return res.status(200).json({
      message: 'Profile picture updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}