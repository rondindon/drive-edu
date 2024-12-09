import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
const prisma = new PrismaClient();

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Get user from Supabase
  const { data: userData, error } = await supabase.auth.getUser(token);
  if (error || !userData || !userData.user) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const userEmail = userData.user.email;
  if (!userEmail) {
    return res.status(401).json({ message: 'Email not found in user data' });
  }

  // Fetch user from Prisma by email
  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    // If no user in database, decide if you want to create one or deny access
    return res.status(401).json({ message: 'User not found in database' });
  }

  (req as any).user = user;
  next();
};
