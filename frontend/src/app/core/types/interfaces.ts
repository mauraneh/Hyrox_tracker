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

