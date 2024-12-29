import { User } from '@prisma/client'; 

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
        // ... any other user properties you attach
      };
    }
  }
}
