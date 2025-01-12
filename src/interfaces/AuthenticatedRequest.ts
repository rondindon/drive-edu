import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string; // no question mark
    role: string;  // no question mark
  };
}

// Define TypeScript interfaces for the worst accuracy questions
export interface WorstAccuracyQuestion {
  questionId: number;
  questionText: string;
  imageUrl?: string; // Allows string, undefined, or null
  correctCount: number;
  wrongCount: number;
  accuracy: number; // Percentage (0 - 100)
  options: string[]; // Array of answer options
  correctAnswer: string; // The correct answer
}