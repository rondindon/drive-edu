// src/types/ReportTypes.ts
export type ReportStatus = "Pending" | "Reviewed" | "Resolved";
export type ReportType =
  | "Content Issue"
  | "Technical Problem"
  | "Duplicate Report"
  | "Other";

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

export interface Question {
  id: number;
  text: string;
  imageUrl?: string;
}

export interface Report {
  id: number;
  user: User;
  question: Question;
  type: ReportType;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  comments?: string;
}