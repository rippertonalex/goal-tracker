"use client";

import { DailyLogWithCompletions } from "@/lib/types";
import { formatDate, getMonthName } from "@/lib/dates";
import { useState } from "react";

interface HeatMapProps {
  logs: DailyLogWithCompletions[];
  goalColor: string;
  onDayClick: (date: string) => void;
  selectedDate: string | null;
}

const colorIntensity: Record<string, string[]> = {
  emerald: [
    "bg-zinc-800/50",
    "bg-emerald-900/60",
    "bg-emerald-700/70",
    "bg-emerald-500/80",
    "bg-emerald-400",
  ],
  blue: [
    "bg-zinc-800/50",
    "bg-blue-900/60",
    "bg-blue-700/70",
    "bg-blue-500/80",
    "bg-blue-400",
  ],
  rose: [
    "bg-zinc-800/50",
    "bg-rose-900/60",
    "bg-rose-700/70",
    "bg-rose-500/80",
    "bg-rose-400",
  ],
  amber: [
    "bg-zinc-800/50",
    "bg-amber-900/60",
    "bg-amber-700/70",
    "bg-amber-500/80",
    "bg-amber-400",
  ],
  purple: [
    "bg-zinc-800/50",
    "bg-purple-900/60",
    "bg-purple-700/70",
    "bg-purple-500/80",
    "bg-purple-400",
  ],
};

const selectedRing: Record<string, string> = {
  emerald: "ring-emerald-400",
  blue: "ring-blue-400",
  rose: "ring-rose-400",
  amber: "ring-amber-400",
  purple: "ring-purple-400",
};

function getCompletionLevel(log: DailyLogWithCompletions | undefined): number {
  if (!log) return 0;
  const total = log.systemCompletions.length;
  if (total === 0) return 0;
  const completed = log.systemCompletions.filter((s) => s.completed).length;
  const ratio = completed / total;
  if (ratio === 0) return 0;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export default function HeatMap({ logs, goalColor, onDayClick, selectedDate }: HeatMapProps) {
  const colors = colorIntensity[goalColor] || colorIntensity.emerald;
  const ring = selectedRing[goalColor] || selectedRing.emerald;
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const today = new Date();
  const totalDays = 182; // ~6 months
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - totalDays);
  // Align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  // Build cells
  const cells: { date: Date; dateStr: string; level: number }[] = [];
  const current = new Date(startDate);
  while (current <= today) {
    const dateStr = formatDate(current);
    const log = logs.find((l) => l.date === dateStr);
    cells.push({
      date: new Date(current),
      dateStr,
      level: getCompletionLevel(log),
    });
    current.setDate(current.getDate() + 1);
  }

  // Group into weeks
  const weeks: typeof cells[] = [];
  let currentWeek: typeof cells = [];
  for (const cell of cells) {
    if (cell.date.getDay() === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(cell);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Month labels
  const monthLabels: { label: string; weekIdx: number }[] = [];
  let lastMonth = -1;
  for (let wi = 0; wi < weeks.length; wi++) {
    const firstDayOfWeek = weeks[wi][0];
    const month = firstDayOfWeek.date.getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ label: getMonthName(month), weekIdx: wi });
      lastMonth = month;
    }
  }

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  // Tooltip info
  const hoveredLog = hoveredDate
    ? logs.find((l) => l.date === hoveredDate)
    : null;

  return (
    <div className="relative">
      {/* Month labels */}
      <div className="flex ml-10 mb-1">
        {monthLabels.map((m, i) => (
          <div
            key={i}
            className="text-[11px] text-zinc-500"
            style={{
              position: "absolute",
              left: `${m.weekIdx * 16 + 40}px`,
            }}
          >
            {m.label}
          </div>
        ))}
      </div>

      <div className="flex mt-5">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-2 mt-0">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-[14px] text-[10px] text-zinc-500 flex items-center justify-end w-7">
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {/* Pad first week if doesn't start on Sunday */}
              {wi === 0 &&
                Array.from({ length: week[0].date.getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} className="w-[14px] h-[14px]" />
                ))}
              {week.map((cell) => (
                <div
                  key={cell.dateStr}
                  className={`w-[14px] h-[14px] rounded-[3px] cursor-pointer transition-all duration-150 ${
                    colors[cell.level]
                  } ${
                    selectedDate === cell.dateStr
                      ? `ring-2 ${ring} ring-offset-1 ring-offset-zinc-950`
                      : ""
                  } hover:ring-1 hover:ring-white/30`}
                  onClick={() => onDayClick(cell.dateStr)}
                  onMouseEnter={() => setHoveredDate(cell.dateStr)}
                  onMouseLeave={() => setHoveredDate(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDate && (
        <div className="mt-3 text-xs text-zinc-400">
          <span className="text-zinc-300 font-medium">{hoveredDate}</span>
          {hoveredLog ? (
            <span>
              {" "}
              — {hoveredLog.systemCompletions.filter((s) => s.completed).length}/
              {hoveredLog.systemCompletions.length} systems completed
            </span>
          ) : (
            <span> — No data logged</span>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-[10px] text-zinc-500">
        <span>Less</span>
        {colors.map((c, i) => (
          <div key={i} className={`w-[12px] h-[12px] rounded-[2px] ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
