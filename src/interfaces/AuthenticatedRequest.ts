import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export interface WorstAccuracyQuestion {
  questionId: number;
  questionText: string;
  imageUrl?: string;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  options: string[];
  correctAnswer: string;
}