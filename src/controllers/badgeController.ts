import { BadgeRank, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';

const prisma = new PrismaClient();

export async function awardTestBadge(userId: number, completedTests: number) {
  let rank: BadgeRank | null = null;
  let title = '';
  let description = '';

  if (completedTests >= 50) {
    rank = 'DIAMOND';
    title = 'Diamond Tester';
    description = 'You have completed 50 or more tests!';
  } else if (completedTests >= 25) {
    rank = 'PLATINUM';
    title = 'Platinum Tester';
    description = 'You have completed 25 or more tests!';
  } else if (completedTests >= 10) {
    rank = 'SILVER';
    title = 'Silver Tester';
    description = 'You have completed 10 or more tests!';
  } else if (completedTests >= 1) {
    rank = 'BRONZE';
    title = 'Bronze Tester';
    description = 'You have completed your first test!';
  }

  if (rank) {
    // Check if the user already has this badge
    const existingBadge = await prisma.badge.findFirst({
      where: { userId, title },
    });
    if (!existingBadge) {
      return await prisma.badge.create({
        data: {
          userId,
          title,
          description,
          rank,
        },
      });
    }
  }
  return null;
}

export async function awardQuestionBadge(userId: number, answeredQuestions: number) {
    let rank: BadgeRank | null = null;
    let title = '';
    let description = '';
  
    if (answeredQuestions >= 500) {
      rank = 'DIAMOND';
      title = 'Diamond Scholar';
      description = 'You have answered 500 or more questions!';
    } else if (answeredQuestions >= 250) {
      rank = 'PLATINUM';
      title = 'Platinum Scholar';
      description = 'You have answered 250 or more questions!';
    } else if (answeredQuestions >= 100) {
      rank = 'SILVER';
      title = 'Silver Scholar';
      description = 'You have answered 100 or more questions!';
    } else if (answeredQuestions >= 10) {
      rank = 'BRONZE';
      title = 'Bronze Scholar';
      description = 'You have answered your first questions!';
    }
  
    if (rank) {
      const existingBadge = await prisma.badge.findFirst({
        where: { userId, title },
      });
      if (!existingBadge) {
        return await prisma.badge.create({
          data: {
            userId,
            title,
            description,
            rank,
          },
        });
      }
    }
    return null;
  }

  export async function getUserBadges(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
  
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
  
      const badges = await prisma.badge.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          description: true,
          rank: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      
      return res.status(200).json(badges);
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }