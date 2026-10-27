"use client";

import { useTransition } from "react";
import Link from "next/link";
import { clearSystemCurrentPeriod, toggleGoalCompleted } from "@/lib/actions";

type CompletedTheme = Awaited<
  ReturnType<typeof import("@/lib/actions").getCompletedData>
>[number];

const colorText: Record<string, string> = {
  emerald: "text-emerald-400",
  blue: "text-blue-400",
  rose: "text-rose-400",
  amber: "text-amber-400",
  purple: "text-purple-400",
};

export default function CompletedClient({
  themes,
}: {
  themes: CompletedTheme[];
}) {
  const [isPending, startTransition] = useTransition();
  const nonEmptyThemes = themes.filter(
    (theme) =>
      theme.completedGoals.length > 0 || theme.completedSystems.length > 0
  );

  if (nonEmptyThemes.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <p className="text-zinc-500">Nothing completed right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {nonEmptyThemes.map((theme) => {
        const accent = colorText[theme.color] || colorText.emerald;

        return (
          <section key={theme.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{theme.emoji}</span>
              <h2 className="text-sm font-bold text-white">{theme.title}</h2>
              <span className={`text-[10px] font-semibold ${accent}`}>
                Theme {theme.number}
              </span>
            </div>

            <div className="space-y-3">
              {theme.completedGoals.length > 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                  <div className="px-4 py-2 border-b border-zinc-800 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Completed Goals
                  </div>
                  {theme.completedGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50 last:border-b-0"
                    >
                      <button
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            await toggleGoalCompleted(goal.id);
                          })
                        }
                        className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center flex-shrink-0"
                        title="Uncomplete goal"
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                      <Link
                        href={`/goals/${goal.id}`}
                        className="text-sm text-zinc-300 hover:text-white flex-1"
                      >
                        {goal.title}
                      </Link>
                      {goal.completedAt && (
                        <span className="text-[10px] text-zinc-600">
                          {new Date(goal.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {theme.completedSystems.length > 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                  <div className="px-4 py-2 border-b border-zinc-800 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Completed Systems
                  </div>
                  {theme.completedSystems.map((system) => (
                    <div
                      key={system.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50 last:border-b-0"
                    >
                      <button
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            await clearSystemCurrentPeriod(
                              system.goalId,
                              system.id
                            );
                          })
                        }
                        className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center flex-shrink-0"
                        title="Clear this period"
                      >
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-300">
                          {system.description}
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">
                          {system.goalTitle} · {system.frequency}
                          {system.targetCount > 1
                            ? ` · ${system.completedCount}/${system.targetCount}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
