import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const offset = Number(req.query.offset) || 0;
    const search = (req.query.search as string) || '';
    const roleFilter = (req.query.role as string) || 'All';

    let whereClause: any = {};

    if (search) {
      // Search by email or username (case-insensitive)
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (roleFilter !== 'All') {
      whereClause.role = roleFilter;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { id: 'asc' },
      take: limit,
      skip: offset,
    });

    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, username } = req.body;

  try {
    const data: any = {};
    if (role) data.role = role;
    if (username !== undefined) data.username = username || null; // handle empty string as null

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });
    return res.json(updatedUser);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    return res.json({ message: 'User deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};