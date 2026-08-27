export enum UserRole {
  COLLEGE_ADMIN = "COLLEGE_ADMIN",
  STUDENT = "STUDENT",
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  idNumber?: string;
  branch?: string;
  year?: string;
  studentClass?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Exam {
  _id: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  totalQuestions: number;
  examDate?: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  status: "DRAFT" | "PUBLISHED" | "COMPLETED";
  createdBy: string;
}

export interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  negativeMarks: number;
  subject: string;
  examId?: any;
}
