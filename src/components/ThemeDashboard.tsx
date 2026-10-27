"use client";

import Link from "next/link";
import type { DashboardTheme } from "@/lib/types";
import {
  toggleSystemCompletion,
  toggleGoalCompleted,
  setSystemCompletionCount,
} from "@/lib/actions";
import { useTransition } from "react";
import InlineHeatmap from "./InlineHeatmap";
import { formatDate } from "@/lib/dates";
import GoalForm from "./forms/GoalForm";
import SystemForm from "./forms/SystemForm";
import ThemeForm from "./forms/ThemeForm";

const colorConfig: Record<
  string,
  {
    border: string;
    bg: string;
    text: string;
    accent: string;
    dot: string;
    checkBg: string;
  }
> = {
  emerald: {
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    accent: "text-emerald-300",
    dot: "bg-emerald-400",
    checkBg: "bg-emerald-500",
  },
  blue: {
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    text: "text-blue-400",
    accent: "text-blue-300",
    dot: "bg-blue-400",
    checkBg: "bg-blue-500",
  },
  rose: {
    border: "border-rose-500/20",
    bg: "bg-rose-500/5",
    text: "text-rose-400",
    accent: "text-rose-300",
    dot: "bg-rose-400",
    checkBg: "bg-rose-500",
  },
  amber: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    accent: "text-amber-300",
    dot: "bg-amber-400",
    checkBg: "bg-amber-500",
  },
  purple: {
    border: "border-purple-500/20",
    bg: "bg-purple-500/5",
    text: "text-purple-400",
    accent: "text-purple-300",
    dot: "bg-purple-400",
    checkBg: "bg-purple-500",
  },
};

const freqLabel: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  one_time: "One-time",
  as_needed: "As Needed",
};

const freqBadge: Record<string, string> = {
  daily: "text-emerald-400/70 bg-emerald-400/10",
  weekly: "text-blue-400/70 bg-blue-400/10",
  one_time: "text-orange-400/70 bg-orange-400/10",
  as_needed: "text-amber-400/70 bg-amber-400/10",
};

function formatDeadline(deadline: Date | string | null): string | null {
  if (!deadline) return null;
  const d = typeof deadline === "string" ? new Date(deadline) : deadline;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntilLabel(days: number | null): {
  text: string;
  urgent: boolean;
} | null {
  if (days === null) return null;
  if (days < 0) return { text: "Overdue", urgent: true };
  if (days === 0) return { text: "Due today", urgent: true };
  if (days === 1) return { text: "Due tomorrow", urgent: true };
  if (days <= 7) return { text: `${days}d left`, urgent: true };
  if (days <= 30) return { text: `${days}d left`, urgent: false };
  return { text: `${days}d left`, urgent: false };
}

interface Props {
  themes: DashboardTheme[];
}

export default function ThemeDashboard({ themes }: Props) {
  const [isPending, startTransition] = useTransition();
  const todayStr = formatDate(new Date());
  const themeOptions = themes.map((theme) => ({
    id: theme.id,
    title: theme.title,
  }));
  const nextThemeNumber =
    themes.reduce((max, theme) => Math.max(max, theme.number), 0) + 1;

  function handleToggle(goalId: string, systemId: string, date?: string) {
    startTransition(async () => {
      await toggleSystemCompletion(goalId, systemId, date ?? todayStr);
    });
  }

  function handleMultiBoxClick(
    goalId: string,
    systemId: string,
    boxIndex: number,
    currentCount: number,
    targetCount: number
  ) {
    // If this box is filled (index < currentCount), unfill it (set count to this index)
    // If this box is empty (index >= currentCount), fill up to it (set count to index + 1)
    const isFilled = boxIndex < currentCount;
    const newCount = isFilled ? boxIndex : boxIndex + 1;
    startTransition(async () => {
      await setSystemCompletionCount(
        goalId,
        systemId,
        todayStr,
        newCount,
        targetCount
      );
    });
  }

  function handleGoalToggle(goalId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await toggleGoalCompleted(goalId);
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-5">
        <ThemeForm
          buttonLabel="+ Add Theme"
          nextNumber={nextThemeNumber}
          buttonClassName="rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:border-zinc-700"
        />
      </div>

      <div className="columns-1 lg:columns-2 gap-5 space-y-5">
      {themes.map((theme) => {
        const c = colorConfig[theme.color] || colorConfig.emerald;

        return (
          <div key={theme.id} className="break-inside-avoid">
            {/* Theme header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{theme.emoji}</span>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-white truncate">
                  {theme.title}
                </h2>
                {theme.identity && (
                  <p className="text-[10px] text-zinc-500 italic mt-0.5 line-clamp-1">
                    {theme.identity}
                  </p>
                )}
              </div>
              <span
                className={`text-[9px] font-semibold ${c.text} uppercase tracking-widest`}
              >
                {theme.number}
              </span>
              <ThemeForm
                buttonLabel="Edit"
                initialTheme={{
                  id: theme.id,
                  title: theme.title,
                  number: theme.number,
                  emoji: theme.emoji,
                  color: theme.color,
                  identity: theme.identity,
                }}
              />
              <GoalForm
                buttonLabel="+ Goal"
                themes={themeOptions}
                defaultThemeId={theme.id}
              />
            </div>

            {/* Goals */}
            <div className="space-y-2">
              {theme.goals.length === 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-3 py-4 text-xs text-zinc-500">
                  All goals in this theme are completed.
                </div>
              )}
              {theme.goals.map((goal) => {
                const deadlineInfo = daysUntilLabel(goal.daysUntilDeadline);

                return (
                  <div
                    key={goal.id}
                    className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden`}
                  >
                    {/* Goal header */}
                    <div className="px-3 py-2.5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Goal completion checkbox */}
                          <button
                            onClick={(e) => handleGoalToggle(goal.id, e)}
                            className="flex-shrink-0"
                          >
                            <div
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                goal.completed
                                  ? `${c.checkBg} border-transparent`
                                  : `border-zinc-600 hover:border-zinc-400`
                              }`}
                            >
                              {goal.completed && (
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
                              )}
                            </div>
                          </button>
                          <Link
                            href={`/goals/${goal.id}`}
                            className={`text-sm font-semibold truncate ${
                              goal.completed
                                ? "text-zinc-500 line-through"
                                : "text-zinc-200"
                            }`}
                          >
                            {goal.title}
                          </Link>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          {deadlineInfo && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                deadlineInfo.urgent
                                  ? "text-amber-300 bg-amber-400/15"
                                  : "text-zinc-400 bg-zinc-800"
                              }`}
                            >
                              {deadlineInfo.text}
                            </span>
                          )}
                          {goal.deadline && (
                            <span className="text-[10px] text-zinc-600">
                              {formatDeadline(goal.deadline)}
                            </span>
                          )}
                          <GoalForm
                            buttonLabel="Edit"
                            themes={themeOptions}
                            initialGoal={{
                              id: goal.id,
                              themeId: theme.id,
                              title: goal.title,
                              notes: goal.notes,
                              deadline: goal.deadline,
                              currentValue: goal.currentValue,
                              targetValue: goal.targetValue,
                              unit: goal.unit,
                            }}
                          />
                          <SystemForm
                            buttonLabel="+ System"
                            goals={[{ id: goal.id, title: goal.title }]}
                            defaultGoalId={goal.id}
                          />
                          <svg
                            className={`w-4 h-4 ${c.text} opacity-0 group-hover:opacity-100 transition-opacity`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>

                    {/* Progress bar (if goal has target/current values) */}
                    {goal.targetValue != null &&
                      goal.currentValue != null && (
                        <div className="px-3 pb-2.5 -mt-1">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${c.checkBg}`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round(
                                      (goal.currentValue /
                                        goal.targetValue) *
                                        100
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-[11px] text-zinc-400 font-medium whitespace-nowrap">
                              {goal.unit === "$"
                                ? `$${(goal.currentValue / 1000).toFixed(0)}k / $${(goal.targetValue / 1000).toFixed(0)}k`
                                : `${goal.currentValue} / ${goal.targetValue}${goal.unit ? ` ${goal.unit}` : ""}`}
                            </span>
                            <span
                              className={`text-[10px] font-semibold ${c.text}`}
                            >
                              {Math.round(
                                (goal.currentValue / goal.targetValue) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      )}

                    {/* Systems under this goal */}
                    {goal.systems.length > 0 && (
                      <div className="border-t border-white/[0.03]">
                        {goal.systems.map((system, si) => {
                          const sysDeadline = system.deadline
                            ? formatDeadline(system.deadline)
                            : null;

                          return (
                            <div
                              key={system.id}
                              className={`flex items-center gap-2.5 px-3 py-2 ${
                                si < goal.systems.length - 1
                                  ? "border-b border-white/[0.03]"
                                  : ""
                              } hover:bg-white/[0.02] transition-colors`}
                            >
                              {/* Toggle checkbox(es) */}
                              {system.targetCount <= 1 ? (
                                /* Single checkbox */
                                <button
                                  onClick={() =>
                                    handleToggle(goal.id, system.id)
                                  }
                                  disabled={isPending}
                                  className="flex-shrink-0"
                                >
                                  <div
                                    className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all ${
                                      system.completedThisPeriod
                                        ? `${c.checkBg} border-transparent`
                                        : "border-zinc-600 hover:border-zinc-400"
                                    }`}
                                  >
                                    {system.completedThisPeriod && (
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
                                    )}
                                  </div>
                                </button>
                              ) : (
                                /* Multi checkboxes — each independently clickable */
                                <div className="flex items-center gap-[3px] flex-shrink-0">
                                  {Array.from({
                                    length: system.targetCount,
                                  }).map((_, idx) => {
                                    const filled =
                                      idx < system.completedCount;
                                    return (
                                      <button
                                        key={idx}
                                        onClick={() =>
                                          handleMultiBoxClick(
                                            goal.id,
                                            system.id,
                                            idx,
                                            system.completedCount,
                                            system.targetCount
                                          )
                                        }
                                        disabled={isPending}
                                      >
                                        <div
                                          className={`w-3.5 h-3.5 rounded-[3px] border-[1.5px] flex items-center justify-center transition-all ${
                                            filled
                                              ? `${c.checkBg} border-transparent`
                                              : "border-zinc-600 hover:border-zinc-400"
                                          }`}
                                        >
                                          {filled && (
                                            <svg
                                              className="w-2 h-2 text-white"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                              strokeWidth={3.5}
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                              />
                                            </svg>
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Description */}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-xs leading-relaxed ${
                                    system.completedThisPeriod
                                      ? "text-zinc-500 line-through"
                                      : "text-zinc-300"
                                  }`}
                                >
                                  {system.description}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span
                                    className={`text-[9px] px-1 py-0 rounded font-medium ${freqBadge[system.frequency]}`}
                                  >
                                    {freqLabel[system.frequency]}
                                  </span>
                                  {sysDeadline && (
                                    <span className="text-[9px] text-zinc-600">
                                      by {sysDeadline}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Inline heatmap */}
                              <div className="flex-shrink-0 hidden sm:block">
                                <InlineHeatmap
                                  completions={system.recentCompletions}
                                  color={theme.color}
                                  onDayClick={(date) =>
                                    handleToggle(goal.id, system.id, date)
                                  }
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

