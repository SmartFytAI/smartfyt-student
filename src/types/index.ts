/**
 * TypeScript types for SmartFyt Student Experience
 */

// User types
export interface User {
  id: string;
  given_name: string;
  family_name: string;
  email: string;
  picture?: string;
  phone_number?: string;
}

export interface UserInfo extends User {
  name: string;
  age: string;
  phoneNumber: string;
  school: string;
  grade: string;
  sleepHours: number;
  studyHours: number;
  activeHours: number;
  stressLevel: number;
  sport: string;
  wearable: string;
  screenTime: number;
  athleticGoals: string;
  academicGoals: string;
  coachName: string;
  coachEmail: string;
  terraProvider?: string;
}

// Health types
export interface HealthData {
  dailySummaries: DailyHealthSummary[];
  sleepDetails: SleepDetail[];
  activityDetails: ActivityDetail[];
}

export interface DailyHealthSummary {
  id: string;
  userId: string;
  date: string;
  steps?: number;
  calories?: number;
  activeMinutes?: number;
  sleepScore?: number;
  readinessScore?: number;
}

export interface SleepDetail {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  duration: number;
  efficiency?: number;
  restlessCount?: number;
  deepSleepMinutes?: number;
  lightSleepMinutes?: number;
  remSleepMinutes?: number;
}

export interface ActivityDetail {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  activityType: string;
  duration: number;
  calories?: number;
  distance?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
}

// Journal types
export interface Journal {
  id: string;
  title: string;
  wentWell: string;
  notWell: string;
  goals: string;
  authorID: string;
  createdAt: string;
  updatedAt: string;
  response: string;
  sleepHours: number;
  activeHours: number;
  stress: number;
  screenTime: number;
  studyHours: number;
}

// Quest types
export interface Quest {
  id: string;
  title: string;
  description: string;
  pointValue: number;
  categoryName: string;
  completedAt?: string | null;
  notes?: string | null;
}

export interface QuestCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface UserQuest {
  id: string;
  userId: string;
  questId: string;
  status: 'assigned' | 'completed' | 'skipped';
  completedAt?: string;
  quest: Quest;
}

// For API responses that return Quest objects directly
export interface QuestResponse {
  id: string;
  title: string;
  description: string;
  pointValue: number;
  categoryName: string;
  completedAt?: string | null;
  notes?: string | null;
}

// Performance types
export interface UserMetrics {
  focus: number;
  effort: number;
  readiness: number;
  motivation: number;
  updatedAt: string;
}

// Dashboard types
export interface DashboardData {
  user: UserInfo;
  healthData: HealthData;
  quests: UserQuest[];
  recentJournals: Journal[];
  metrics: UserMetrics;
  stats: UserStat[];
}

export interface UserStat {
  id: string;
  categoryId: string;
  categoryName: string;
  points: number;
  level: number;
}

// Form types
export interface UserForm {
  id: string;
  title: string;
  name: string;
  age: string;
  email: string;
  phone: string;
  sleepHours: number;
  studyHours: number;
  activeHours: number;
  stress: number;
  sport?: { id: string; name: string };
  wearable: string;
  screenTime: number;
  athleticGoals: string;
  academicGoals: string;
  podcast?: string;
  response: string;
  createdAt: string;
  updatedAt: string;
  team?: { id: string; name: string };
  teamID?: string;
  grade: string;
}

// Sports and Schools
export interface Sport {
  id: string;
  name: string;
}

export interface School {
  id: string;
  name: string;
}

// Team types
export interface Team {
  id: string;
  name: string;
  sportID: string;
  schoolID?: string;
  sport?: { id: string; name: string };
  school?: { id: string; name: string };
}

export interface TeamMembership {
  id: string;
  userId: string;
  teamId: string;
  role: 'coach' | 'member';
  team: Team;
}

export interface LeaderboardEntry {
  userId: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  engagementScore: number;
  weeklySteps: number;
  questsCompleted: number;
  journalsCount: number;
  rank: number;
  trend: 'up' | 'down' | 'none';
  claps: number;
  isCurrentUser: boolean;
}

export interface TeamActivityData {
  teamId: string;
  teamName: string;
  sport: string;
  school: string | null;
  memberCount: number;
  totalWeeklySteps: number;
  avgStepsPerMember: number;
  totalEngagementScore: number;
  avgEngagementScore: number;
  totalActiveMinutes: number;
  userRole: string;
  isUserTeam: boolean;
  topPerformers: {
    userId: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
    weeklySteps: number;
    engagementScore: number;
  }[];
}

export interface TeamPost {
  id: string;
  title: string;
  content: string;
  formattedContent: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  teamID: string;
  authorID: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
}

export interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  type: 'steps' | 'quests' | 'journals' | 'activity';
  target: number;
  currentProgress: number;
  deadline: string;
  reward: string;
  participatingTeams: string[];
  leaderboard: TeamChallengeEntry[];
  isActive: boolean;
}

export interface TeamChallengeEntry {
  teamId: string;
  teamName: string;
  progress: number;
  rank: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}
