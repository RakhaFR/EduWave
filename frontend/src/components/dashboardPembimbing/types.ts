export interface PembimbingCourse {
  id: string;
  title: string;
  category: string;
  students: number;
  status: string;
  description: string;
}

export interface Exam {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  duration: number;
  totalQuestions: number;
  status: string;
  deadline: string;
}
