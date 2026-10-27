import type {
  Theme as PrismaTheme,
  Goal as PrismaGoal,
  System as PrismaSystem,
  DailyLog as PrismaDailyLog,
  SystemCompletion as PrismaSystemCompletion,
} from "@/generated/prisma/client";

export type Theme = PrismaTheme;
export type Goal = PrismaGoal;
export type System = PrismaSystem;
export type DailyLog = PrismaDailyLog;
export type SystemCompletion = PrismaSystemCompletion;

// Composite types

export type SystemWithCompletions = PrismaSystem & {
  completions: PrismaSystemCompletion[];
};

export type DailyLogWithCompletions = PrismaDailyLog & {
  systemCompletions: PrismaSystemCompletion[];
};

export type GoalWithSystems = PrismaGoal & {
  systems: PrismaSystem[];
};

export type GoalFull = PrismaGoal & {
  systems: PrismaSystem[];
  dailyLogs: DailyLogWithCompletions[];
};

export type ThemeWithGoals = PrismaTheme & {
  goals: GoalWithSystems[];
};

export type ThemeFull = PrismaTheme & {
  goals: GoalFull[];
};

// Dashboard types

export type DashboardSystem = {
  id: string;
  description: string;
  frequency: string;
  deadline: Date | null;
  targetCount: number; // how many times per period (1 = normal checkbox)
  completedCount: number; // how many completed this period
  completedThisPeriod: boolean; // completedCount >= targetCount
  recentCompletions: { date: string; completed: boolean }[]; // last 8 weeks
};

export type DashboardGoal = {
  id: string;
  title: string;
  notes: string;
  deadline: Date | null;
  daysUntilDeadline: number | null;
  completed: boolean;
  completedAt: Date | null;
  currentValue: number | null;
  targetValue: number | null;
  unit: string | null;
  systems: DashboardSystem[];
  completionRate: number; // 0-100 overall
};

export type DashboardTheme = {
  id: string;
  number: number;
  title: string;
  emoji: string;
  color: string;
  identity: string;
  goals: DashboardGoal[];
};
