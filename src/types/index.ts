export type DrawingSurface = 'whiteboard' | 'paper' | 'sketch';

export type DrawingTool =
  | 'pen'
  | 'pencil'
  | 'marker'
  | 'sketch'
  | 'eraser'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'fill';

export interface Technique {
  id: string;
  title: string;
  category: 'Fundamentals' | 'Shading & Texture' | 'Color & Inking' | 'Styles';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  description: string;
  steps: {
    number: number;
    title: string;
    description: string;
  }[];
  tips: string[];
  recommendedTool: DrawingTool;
  recommendedSurface: DrawingSurface;
  recommendedColor: string;
  recommendedWidth: number;
  tags: string[];
  illustrationType:
    | 'gesture'
    | 'hatching'
    | 'stippling'
    | 'blending'
    | 'perspective'
    | 'lighting'
    | 'lineart'
    | 'textures';
}

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  avatarUrl?: string;
  isGuest: boolean;
  streak: number;
  bestStreak: number;
  totalDrawings: number;
  lastDrawnDate?: string;
  monthlyStreak?: number;
  monthlyDrawings?: number;
  monthlyKey?: string;
  badges: string[];
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  streak: number;
  bestStreak: number;
  totalDrawings: number;
  monthlyStreak: number;
  monthlyDrawings: number;
  lastDrawnDate?: string;
  badge: string;
  isCurrentUser?: boolean;
  joinedAt?: string;
}

export interface LeaderboardResponse {
  allTime: LeaderboardEntry[];
  thisMonth: LeaderboardEntry[];
  source: 'supabase' | 'api' | 'local';
  needsTableSetup?: boolean;
  error?: string;
}

export interface DailyPrompt {
  id: string;
  date: string;
  title: string;
  theme: string;
  description: string;
  suggestedTools: string[];
  difficulty: string;
}

export interface DrawingHistoryItem {
  id: string;
  date: string;
  title: string;
  thumbnail?: string;
  surface: DrawingSurface;
}
