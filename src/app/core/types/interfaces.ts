export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  category?: string | null;
  weight?: number | null;
  height?: number | null;
  avatar?: string | null;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
  };
  message: string;
}

export interface Goal {
  id: string;
  title: string;
  targetTime: number | null;
  targetDate: string | null;
  achieved: boolean;
  achievedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StatsOverview {
  totalCourses: number;
  totalTrainings: number;
  bestTime: number | null;
  latestTime: number | null;
  averageTime: number | null;
  nextHyrox: {
    name: string;
    city: string;
    date: string;
  } | null;
  improvement: number | null;
}

export interface ProgressionData {
  id: string;
  name: string;
  date: string;
  totalTime: number;
  category: string;
}

export interface StationStats {
  best: number;
  average: number;
  latest: number;
  bestPlace: number | null;
  averagePlace: number | null;
}

export interface BestAvgLatest {
  best: number | null;
  average: number | null;
  latest: number | null;
}

export interface RoxzoneStats {
  roxzoneTime: BestAvgLatest;
  runTotal: BestAvgLatest;
  bestRunLap: BestAvgLatest;
}

export interface CourseTime {
  id: string;
  segment: string;
  timeSeconds: number;
  place: number | null;
}

export interface Course {
  id: string;
  name: string;
  city: string;
  date: string;
  category: string;
  totalTime: number;
  roxzoneTime: number | null;
  runTotal: number | null;
  bestRunLap: number | null;
  notes: string | null;
  times?: CourseTime[];
}
