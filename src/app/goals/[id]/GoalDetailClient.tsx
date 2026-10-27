"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  toggleSystemCompletion,
  updateGoalNotes,
  updateGoalProgress,
} from "@/lib/actions";
import { formatDate } from "@/lib/dates";
import HeatMap from "@/components/HeatMap";
import SystemChecklist from "@/components/SystemChecklist";
import GoalForm from "@/components/forms/GoalForm";
import SystemForm from "@/components/forms/SystemForm";
import type {
  Goal,
  System,
  DailyLogWithCompletions,
  Theme,
} from "@/lib/types";

type GoalDetailData = Goal & {
  theme: Theme;
  systems: System[];
  dailyLogs: DailyLogWithCompletions[];
};

const colorAccent: Record<string, string> = {
  emerald: "text-emerald-400",
  blue: "text-blue-400",
  rose: "text-rose-400",
  amber: "text-amber-400",
  purple: "text-purple-400",
};

const bgAccent: Record<string, string> = {
  emerald: "bg-emerald-500/10 border-emerald-500/20",
  blue: "bg-blue-500/10 border-blue-500/20",
  rose: "bg-rose-500/10 border-rose-500/20",
  amber: "bg-amber-500/10 border-amber-500/20",
  purple: "bg-purple-500/10 border-purple-500/20",
};

interface Props {
  goal: GoalDetailData;
  themes: { id: string; title: string }[];
}

export default function GoalDetailClient({ goal, themes }: Props) {
  const todayStr = formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(goal.notes);
  const [editingNotes, setEditingNotes] = useState(false);
  const [progressValue, setProgressValue] = useState(
    goal.currentValue?.toString() ?? ""
  );
  const [editingProgress, setEditingProgress] = useState(false);

  const theme = goal.theme;
  const goalOptions = [{ id: goal.id, title: goal.title }];
  const accent = colorAccent[theme.color] || colorAccent.emerald;
  const bgAcc = bgAccent[theme.color] || bgAccent.emerald;
  const isToday = selectedDate === todayStr;

  // Find log for selected date
  const selectedLog = goal.dailyLogs.find((l) => l.date === selectedDate);

  const completions = goal.systems.map((system) => {
    const completion = selectedLog?.systemCompletions.find(
      (sc) => sc.systemId === system.id
    );
    return {
      id: completion?.id ?? "",
      systemId: system.id,
      dailyLogId: selectedLog?.id ?? "",
      completed: completion?.completed ?? false,
      count: completion?.count ?? 0,
    };
  });

  function handleToggle(systemId: string) {
    startTransition(async () => {
      await toggleSystemCompletion(goal.id, systemId, selectedDate);
    });
  }

  function handleDayClick(date: string) {
    setSelectedDate(date);
  }

  function handleSaveNotes() {
    startTransition(async () => {
      await updateGoalNotes(goal.id, notes);
      setEditingNotes(false);
    });
  }

  // Stats
  const totalLogged = goal.dailyLogs.length;
  const perfectDays = goal.dailyLogs.filter((l) => {
    const total = goal.systems.length;
    const completed = l.systemCompletions.filter((s) => s.completed).length;
    return total > 0 && completed === total;
  }).length;

  const completionRate =
    totalLogged > 0 && goal.systems.length > 0
      ? Math.round(
          (goal.dailyLogs.reduce((sum, l) => {
            const completed = l.systemCompletions.filter(
              (s) => s.completed
            ).length;
            return sum + completed / goal.systems.length;
          }, 0) /
            totalLogged) *
            100
        )
      : 0;

  // Deadline info
  const deadlineStr = goal.deadline
    ? new Date(goal.deadline).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const daysUntil = goal.deadline
    ? Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div>
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Dashboard
      </Link>

      {/* Goal header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{theme.emoji}</span>
          <span
            className={`text-[10px] font-semibold ${accent} uppercase tracking-widest`}
          >
            {theme.title}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {goal.title}
        </h1>
        {deadlineStr && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">
              📅 {deadlineStr}
            </span>
            {daysUntil !== null && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  daysUntil <= 7
                    ? "text-amber-300 bg-amber-400/15"
                    : "text-zinc-400 bg-zinc-800"
                }`}
              >
                {daysUntil < 0
                  ? "Overdue"
                  : daysUntil === 0
                  ? "Due today"
                  : `${daysUntil} days left`}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-3 mt-4">
          <GoalForm
            buttonLabel="Edit Goal"
            themes={themes}
            initialGoal={{
              id: goal.id,
              themeId: goal.themeId,
              title: goal.title,
              notes: goal.notes,
              deadline: goal.deadline,
              currentValue: goal.currentValue,
              targetValue: goal.targetValue,
              unit: goal.unit,
            }}
            buttonClassName="rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:border-zinc-700"
          />
          <SystemForm
            buttonLabel="+ Add System"
            goals={goalOptions}
            defaultGoalId={goal.id}
            buttonClassName="rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:border-zinc-700"
          />
        </div>
      </div>

      {/* Identity */}
      {theme.identity && (
        <div className={`rounded-xl border ${bgAcc} p-4 mb-6`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">🪞</span>
            <h3
              className={`text-[10px] font-semibold ${accent} uppercase tracking-wider`}
            >
              Identity
            </h3>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed italic">
            &ldquo;{theme.identity}&rdquo;
          </p>
        </div>
      )}

      {/* Progress bar (if goal has target/current values) */}
      {goal.targetValue != null && goal.currentValue != null && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">📊</span>
              <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Progress
              </h3>
            </div>
            {!editingProgress ? (
              <button
                onClick={() => setEditingProgress(true)}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Update
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={progressValue}
                  onChange={(e) => setProgressValue(e.target.value)}
                  className="w-28 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  placeholder="Current value"
                />
                <button
                  onClick={() => {
                    setEditingProgress(false);
                    setProgressValue(goal.currentValue?.toString() ?? "");
                  }}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const val = parseFloat(progressValue);
                    if (!isNaN(val)) {
                      startTransition(async () => {
                        await updateGoalProgress(goal.id, val);
                        setEditingProgress(false);
                      });
                    }
                  }}
                  className={`text-[10px] ${accent} font-semibold`}
                >
                  Save
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${
                  theme.color === "emerald"
                    ? "from-emerald-500 to-emerald-400"
                    : theme.color === "blue"
                    ? "from-blue-500 to-blue-400"
                    : theme.color === "rose"
                    ? "from-rose-500 to-rose-400"
                    : theme.color === "amber"
                    ? "from-amber-500 to-amber-400"
                    : "from-purple-500 to-purple-400"
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (goal.currentValue / goal.targetValue) * 100
                    )
                  )}%`,
                }}
              />
            </div>
            <span className="text-sm font-bold text-white whitespace-nowrap">
              {Math.round(
                (goal.currentValue / goal.targetValue) * 100
              )}
              %
            </span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[11px] text-zinc-500">
              {goal.unit === "$"
                ? `$${(goal.currentValue / 1000).toFixed(0)}k`
                : `${goal.currentValue}${goal.unit ? ` ${goal.unit}` : ""}`}
            </span>
            <span className="text-[11px] text-zinc-500">
              {goal.unit === "$"
                ? `$${(goal.targetValue / 1000).toFixed(0)}k`
                : `${goal.targetValue}${goal.unit ? ` ${goal.unit}` : ""}`}
            </span>
          </div>
        </div>
      )}

      {/* Notes (editable) */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">📝</span>
            <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Notes
            </h3>
          </div>
          {!editingNotes ? (
            <button
              onClick={() => setEditingNotes(true)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setNotes(goal.notes);
                  setEditingNotes(false);
                }}
                className="text-[10px] text-zinc-500 hover:text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className={`text-[10px] ${accent} font-semibold`}
              >
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
        {editingNotes ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-600"
            rows={4}
            placeholder="Add notes about this goal..."
          />
        ) : (
          <p className="text-zinc-400 text-sm leading-relaxed">
            {goal.notes || (
              <span className="text-zinc-600 italic">No notes yet — click Edit to add some</span>
            )}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
          <div className="text-xl font-bold text-white">
            {goal.systems.length}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Systems</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
          <div className="text-xl font-bold text-white">{totalLogged}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Days Logged</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
          <div className="text-xl font-bold text-white">{perfectDays}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Perfect Days</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
          <div className="text-xl font-bold text-white">
            {completionRate}%
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Avg Completion</div>
        </div>
      </div>

      {/* System management */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Manage Systems
          </h3>
          <SystemForm
            buttonLabel="+ Add"
            goals={goalOptions}
            defaultGoalId={goal.id}
          />
        </div>
        {goal.systems.length === 0 ? (
          <p className="text-sm text-zinc-600">No systems yet.</p>
        ) : (
          <div className="space-y-2">
            {goal.systems.map((system) => (
              <div
                key={system.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm text-zinc-300 truncate">
                    {system.description}
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    {system.frequency}
                    {system.targetCount > 1 ? ` · ${system.targetCount}x` : ""}
                  </p>
                </div>
                <SystemForm
                  buttonLabel="Edit"
                  goals={goalOptions}
                  initialSystem={{
                    id: system.id,
                    goalId: goal.id,
                    description: system.description,
                    frequency: system.frequency,
                    targetCount: system.targetCount,
                    deadline: system.deadline,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Heatmap */}
      {goal.systems.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-6">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">
            Activity — Last 6 Months
          </h3>
          <div className="overflow-x-auto">
            <HeatMap
              logs={goal.dailyLogs}
              goalColor={theme.color}
              onDayClick={handleDayClick}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      )}

      {/* Daily check-in */}
      {goal.systems.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                {isToday
                  ? "Today's Check-in"
                  : `Check-in for ${selectedDate}`}
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {isToday
                  ? "Check off systems you completed today"
                  : "Click a day on the heatmap to view or edit"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isPending && (
                <div className="w-3 h-3 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
              )}
              {isToday && (
                <div
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${bgAcc} ${accent}`}
                >
                  Today
                </div>
              )}
            </div>
          </div>

          <SystemChecklist
            systems={goal.systems}
            completions={completions}
            onToggle={handleToggle}
            goalColor={theme.color}
          />
        </div>
      )}

      {/* Quote */}
      <div className="mt-12 text-center">
        <p className="text-zinc-600 text-sm italic">
          &ldquo;Habits are the compound interest of self-improvement.&rdquo;
        </p>
      </div>
    </div>
  );
}
