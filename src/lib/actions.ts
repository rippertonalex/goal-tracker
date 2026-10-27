"use server";

import { prisma } from "./db";
import { revalidatePath } from "next/cache";
import type { DashboardTheme, DashboardGoal, DashboardSystem } from "./types";

// ============ DASHBOARD DATA ============

export async function getDashboardData(): Promise<DashboardTheme[]> {
  const themes = await prisma.theme.findMany({
    include: {
      goals: {
        include: {
          systems: {
            include: {
              completions: {
                include: { dailyLog: true },
              },
            },
          },
          dailyLogs: {
            include: { systemCompletions: true },
          },
        },
      },
    },
    orderBy: { number: "asc" },
  });

  const today = new Date();
  const todayStr = fmtDate(today);

  // Build date range for last 8 weeks of history
  const historyDates: string[] = [];
  for (let i = 55; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    historyDates.push(fmtDate(d));
  }

  // Weekly window (Mon-Sun)
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);
  const weekStartStr = fmtDate(weekStart);

  return themes.map((theme) => ({
    id: theme.id,
    number: theme.number,
    title: theme.title,
    emoji: theme.emoji,
    color: theme.color,
    identity: theme.identity,
    goals: theme.goals.filter((goal) => !goal.completed).map((goal): DashboardGoal => {
      const daysUntil = goal.deadline
        ? Math.ceil(
            (goal.deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          )
        : null;

      const systems: DashboardSystem[] = goal.systems.map((system) => {
        const targetCount = system.targetCount || 1;

        // Count completions this period
        let completedCount = 0;

        if (system.frequency === "daily") {
          const todayLog = goal.dailyLogs.find((l) => l.date === todayStr);
          if (todayLog) {
            const sc = todayLog.systemCompletions.find(
              (c) => c.systemId === system.id
            );
            if (sc?.completed) completedCount = 1;
          }
        } else if (system.frequency === "weekly") {
          // Sum up counts across all days this week
          for (const log of goal.dailyLogs) {
            if (log.date >= weekStartStr && log.date <= todayStr) {
              const sc = log.systemCompletions.find(
                (c) => c.systemId === system.id
              );
              if (sc) {
                // For multi-count systems, use the count field; for single, use completed
                completedCount += targetCount > 1 ? (sc.count || 0) : (sc.completed ? 1 : 0);
              }
            }
          }
        } else if (system.frequency === "one_time") {
          for (const log of goal.dailyLogs) {
            const sc = log.systemCompletions.find(
              (c) => c.systemId === system.id
            );
            if (sc?.completed) {
              completedCount = targetCount; // fully done
              break;
            }
          }
        } else {
          // as_needed: check today
          const todayLog = goal.dailyLogs.find((l) => l.date === todayStr);
          if (todayLog) {
            const sc = todayLog.systemCompletions.find(
              (c) => c.systemId === system.id
            );
            if (sc?.completed) completedCount = 1;
          }
        }

        const completedThisPeriod = completedCount >= targetCount;

        // Build recent completions history
        const recentCompletions = historyDates.map((date) => {
          if (system.frequency === "weekly") {
            // For ALL weekly systems: check the whole week containing this date
            const d = new Date(date);
            const dow = d.getDay();
            const dSinceMon = dow === 0 ? 6 : dow - 1;
            const wStart = new Date(d);
            wStart.setDate(wStart.getDate() - dSinceMon);
            const wEnd = new Date(wStart);
            wEnd.setDate(wEnd.getDate() + 6);
            const wStartStr = fmtDate(wStart);
            const wEndStr = fmtDate(wEnd);

            let weekTotal = 0;
            for (const log of goal.dailyLogs) {
              if (log.date >= wStartStr && log.date <= wEndStr) {
                const sc = log.systemCompletions.find(
                  (c) => c.systemId === system.id
                );
                if (sc) {
                  weekTotal += targetCount > 1 ? (sc.count || 0) : (sc.completed ? 1 : 0);
                }
              }
            }
            return { date, completed: weekTotal >= targetCount };
          }

          // Daily / one_time / as_needed: check just this day
          const log = goal.dailyLogs.find((l) => l.date === date);
          if (!log) return { date, completed: false };
          const sc = log.systemCompletions.find(
            (c) => c.systemId === system.id
          );
          return { date, completed: sc?.completed ?? false };
        });

        return {
          id: system.id,
          description: system.description,
          frequency: system.frequency,
          deadline: system.deadline,
          targetCount,
          completedCount: Math.min(completedCount, targetCount),
          completedThisPeriod,
          recentCompletions,
        };
      });

      // Overall completion rate for the goal
      const totalLogs = goal.dailyLogs.length;
      let completionRate = 0;
      if (totalLogs > 0 && goal.systems.length > 0) {
        const totalChecks = totalLogs * goal.systems.length;
        const completedChecks = goal.dailyLogs.reduce((sum, log) => {
          return (
            sum + log.systemCompletions.filter((sc) => sc.completed).length
          );
        }, 0);
        completionRate = Math.round((completedChecks / totalChecks) * 100);
      }

      return {
        id: goal.id,
        title: goal.title,
        notes: goal.notes,
        deadline: goal.deadline,
        daysUntilDeadline: daysUntil,
        completed: goal.completed,
        completedAt: goal.completedAt,
        currentValue: goal.currentValue,
        targetValue: goal.targetValue,
        unit: goal.unit,
        systems,
        completionRate,
      };
    }),
  }));
}

// ============ GOAL DETAIL ============

export async function getGoalDetail(goalId: string) {
  return prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      theme: true,
      systems: true,
      dailyLogs: {
        include: { systemCompletions: true },
        orderBy: { date: "desc" },
      },
    },
  });
}

export async function updateGoalNotes(goalId: string, notes: string) {
  await prisma.goal.update({
    where: { id: goalId },
    data: { notes },
  });
  revalidatePath("/");
  revalidatePath("/completed");
  revalidatePath(`/goals/${goalId}`);
}

export async function updateGoalProgress(goalId: string, currentValue: number) {
  await prisma.goal.update({
    where: { id: goalId },
    data: { currentValue },
  });
  revalidatePath("/");
  revalidatePath(`/goals/${goalId}`);
}

// ============ GOAL COMPLETION ============

export async function toggleGoalCompleted(goalId: string) {
  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) return;

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      completed: !goal.completed,
      completedAt: !goal.completed ? new Date() : null,
    },
  });
  revalidatePath("/");
  revalidatePath(`/goals/${goalId}`);
}

// ============ SYSTEM TOGGLE ============

/** Toggle a single-count system (targetCount=1) */
export async function toggleSystemCompletion(
  goalId: string,
  systemId: string,
  date: string
) {
  // Upsert daily log
  const dailyLog = await prisma.dailyLog.upsert({
    where: { goalId_date: { goalId, date } },
    create: { goalId, date },
    update: {},
  });

  // Toggle completion
  const existing = await prisma.systemCompletion.findUnique({
    where: {
      systemId_dailyLogId: { systemId, dailyLogId: dailyLog.id },
    },
  });

  if (existing) {
    const newCompleted = !existing.completed;
    await prisma.systemCompletion.update({
      where: { id: existing.id },
      data: { completed: newCompleted, count: newCompleted ? 1 : 0 },
    });
  } else {
    await prisma.systemCompletion.create({
      data: {
        systemId,
        dailyLogId: dailyLog.id,
        completed: true,
        count: 1,
      },
    });
  }

  revalidatePath("/");
  revalidatePath(`/goals/${goalId}`);
}

/** Set count for a multi-count system (targetCount > 1).
 *  Called when clicking individual mini-boxes. */
export async function setSystemCompletionCount(
  goalId: string,
  systemId: string,
  date: string,
  newCount: number,
  targetCount: number
) {
  const dailyLog = await prisma.dailyLog.upsert({
    where: { goalId_date: { goalId, date } },
    create: { goalId, date },
    update: {},
  });

  const existing = await prisma.systemCompletion.findUnique({
    where: {
      systemId_dailyLogId: { systemId, dailyLogId: dailyLog.id },
    },
  });

  const clampedCount = Math.max(0, Math.min(newCount, targetCount));
  const isCompleted = clampedCount >= targetCount;

  if (existing) {
    await prisma.systemCompletion.update({
      where: { id: existing.id },
      data: { count: clampedCount, completed: isCompleted },
    });
  } else {
    await prisma.systemCompletion.create({
      data: {
        systemId,
        dailyLogId: dailyLog.id,
        count: clampedCount,
        completed: isCompleted,
      },
    });
  }

  revalidatePath("/");
  revalidatePath(`/goals/${goalId}`);
}

export async function clearSystemCurrentPeriod(goalId: string, systemId: string) {
  const system = await prisma.system.findUnique({ where: { id: systemId } });
  if (!system) return;

  const today = new Date();
  const todayStr = fmtDate(today);

  if (system.frequency === "weekly") {
    const dayOfWeek = today.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - daysSinceMonday);
    const weekStartStr = fmtDate(weekStart);

    const logs = await prisma.dailyLog.findMany({
      where: {
        goalId,
        date: { gte: weekStartStr, lte: todayStr },
      },
      select: { id: true },
    });

    await prisma.systemCompletion.deleteMany({
      where: {
        systemId,
        dailyLogId: { in: logs.map((log) => log.id) },
      },
    });
  } else if (system.frequency === "one_time") {
    await prisma.systemCompletion.deleteMany({ where: { systemId } });
  } else {
    const log = await prisma.dailyLog.findUnique({
      where: { goalId_date: { goalId, date: todayStr } },
      select: { id: true },
    });

    if (log) {
      await prisma.systemCompletion.deleteMany({
        where: { systemId, dailyLogId: log.id },
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/completed");
  revalidatePath(`/goals/${goalId}`);
}

// ============ COMPLETED VIEW ============

export async function getCompletedData() {
  const themes = await getDashboardData();

  const rawThemes = await prisma.theme.findMany({
    include: {
      goals: {
        where: { completed: true },
        include: { systems: true },
      },
    },
    orderBy: { number: "asc" },
  });

  return themes.map((theme) => {
    const rawTheme = rawThemes.find((item) => item.id === theme.id);
    const completedSystems = theme.goals.flatMap((goal) =>
      goal.systems
        .filter((system) => system.completedThisPeriod)
        .map((system) => ({
          ...system,
          goalId: goal.id,
          goalTitle: goal.title,
        }))
    );

    return {
      id: theme.id,
      number: theme.number,
      title: theme.title,
      emoji: theme.emoji,
      color: theme.color,
      completedGoals:
        rawTheme?.goals.map((goal) => ({
          id: goal.id,
          title: goal.title,
          completedAt: goal.completedAt,
        })) ?? [],
      completedSystems,
    };
  });
}

// ============ THEME ACTIONS ============

export async function getThemes() {
  return prisma.theme.findMany({
    include: { goals: { include: { systems: true } } },
    orderBy: { number: "asc" },
  });
}

// ============ CRUD ACTIONS ============

type ThemeInput = {
  title: string;
  number?: number;
  emoji: string;
  color: string;
  identity?: string;
};

type GoalInput = {
  themeId: string;
  title: string;
  notes?: string;
  deadline?: string;
  currentValue?: string;
  targetValue?: string;
  unit?: string;
};

type SystemInput = {
  goalId: string;
  description: string;
  frequency: string;
  targetCount?: number;
  deadline?: string;
};

export async function createTheme(data: ThemeInput) {
  const nextNumber =
    data.number ??
    ((await prisma.theme.aggregate({ _max: { number: true } }))._max.number ??
      0) + 1;

  await prisma.theme.create({
    data: {
      title: data.title.trim(),
      number: nextNumber,
      emoji: data.emoji.trim() || "🎯",
      color: data.color,
      identity: data.identity?.trim() ?? "",
    },
  });

  revalidateDashboardPaths();
}

export async function updateTheme(id: string, data: ThemeInput) {
  await prisma.theme.update({
    where: { id },
    data: {
      title: data.title.trim(),
      number: data.number ?? 0,
      emoji: data.emoji.trim() || "🎯",
      color: data.color,
      identity: data.identity?.trim() ?? "",
    },
  });

  revalidateDashboardPaths();
}

export async function deleteTheme(id: string) {
  await prisma.theme.delete({ where: { id } });
  revalidateDashboardPaths();
}

export async function createGoal(data: GoalInput) {
  const goal = await prisma.goal.create({
    data: {
      themeId: data.themeId,
      title: data.title.trim(),
      notes: data.notes?.trim() ?? "",
      deadline: parseOptionalDate(data.deadline),
      currentValue: parseOptionalNumber(data.currentValue),
      targetValue: parseOptionalNumber(data.targetValue),
      unit: data.unit?.trim() || null,
    },
  });

  revalidateDashboardPaths();
  revalidatePath(`/goals/${goal.id}`);
  return goal;
}

export async function updateGoal(id: string, data: GoalInput) {
  await prisma.goal.update({
    where: { id },
    data: {
      themeId: data.themeId,
      title: data.title.trim(),
      notes: data.notes?.trim() ?? "",
      deadline: parseOptionalDate(data.deadline),
      currentValue: parseOptionalNumber(data.currentValue),
      targetValue: parseOptionalNumber(data.targetValue),
      unit: data.unit?.trim() || null,
    },
  });

  revalidateDashboardPaths();
  revalidatePath(`/goals/${id}`);
}

export async function deleteGoal(id: string) {
  await prisma.goal.delete({ where: { id } });
  revalidateDashboardPaths();
  revalidatePath(`/goals/${id}`);
}

export async function createSystem(data: SystemInput) {
  const system = await prisma.system.create({
    data: {
      goalId: data.goalId,
      description: data.description.trim(),
      frequency: data.frequency,
      targetCount: data.targetCount ?? 1,
      deadline: parseOptionalDate(data.deadline),
    },
  });

  revalidateDashboardPaths();
  revalidatePath(`/goals/${data.goalId}`);
  return system;
}

export async function updateSystem(id: string, data: SystemInput) {
  const existing = await prisma.system.findUnique({
    where: { id },
    select: { goalId: true },
  });

  await prisma.system.update({
    where: { id },
    data: {
      goalId: data.goalId,
      description: data.description.trim(),
      frequency: data.frequency,
      targetCount: data.targetCount ?? 1,
      deadline: parseOptionalDate(data.deadline),
    },
  });

  revalidateDashboardPaths();
  revalidatePath(`/goals/${data.goalId}`);
  if (existing?.goalId && existing.goalId !== data.goalId) {
    revalidatePath(`/goals/${existing.goalId}`);
  }
}

export async function deleteSystem(id: string, goalId: string) {
  await prisma.system.delete({ where: { id } });
  revalidateDashboardPaths();
  revalidatePath(`/goals/${goalId}`);
}

// ============ HELPERS ============

function parseOptionalDate(value?: string): Date | null {
  if (!value) return null;
  return new Date(`${value}T12:00:00`);
}

function parseOptionalNumber(value?: string): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function revalidateDashboardPaths() {
  revalidatePath("/");
  revalidatePath("/completed");
  revalidatePath("/db");
}

function fmtDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
