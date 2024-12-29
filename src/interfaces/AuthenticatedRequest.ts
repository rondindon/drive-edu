import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string; // no question mark
    role: string;  // no question mark
  };
}