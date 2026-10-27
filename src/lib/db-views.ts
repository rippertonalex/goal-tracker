"use server";

import { prisma } from "./db";

export async function getAllDbData() {
  const [themes, goals, systems, dailyLogs, systemCompletions] =
    await Promise.all([
      prisma.theme.findMany({ orderBy: { number: "asc" } }),
      prisma.goal.findMany({
        include: { theme: { select: { title: true } } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.system.findMany({
        include: { goal: { select: { title: true } } },
        orderBy: { goalId: "asc" },
      }),
      prisma.dailyLog.findMany({
        include: { goal: { select: { title: true } } },
        orderBy: { date: "desc" },
      }),
      prisma.systemCompletion.findMany({
        include: {
          system: { select: { description: true } },
          dailyLog: { select: { date: true, goal: { select: { title: true } } } },
        },
        orderBy: { dailyLogId: "desc" },
      }),
    ]);

  return { themes, goals, systems, dailyLogs, systemCompletions };
}

