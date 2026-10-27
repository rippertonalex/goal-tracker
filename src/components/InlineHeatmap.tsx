"use client";

interface InlineHeatmapProps {
  completions: { date: string; completed: boolean }[];
  color: string;
  onDayClick?: (date: string) => void;
}

const colorMap: Record<string, { on: string; off: string; hover: string }> = {
  emerald: { on: "bg-emerald-400", off: "bg-zinc-800", hover: "hover:bg-emerald-400/30" },
  blue: { on: "bg-blue-400", off: "bg-zinc-800", hover: "hover:bg-blue-400/30" },
  rose: { on: "bg-rose-400", off: "bg-zinc-800", hover: "hover:bg-rose-400/30" },
  amber: { on: "bg-amber-400", off: "bg-zinc-800", hover: "hover:bg-amber-400/30" },
  purple: { on: "bg-purple-400", off: "bg-zinc-800", hover: "hover:bg-purple-400/30" },
};

export default function InlineHeatmap({ completions, color, onDayClick }: InlineHeatmapProps) {
  const colors = colorMap[color] || colorMap.emerald;
  const clickable = !!onDayClick;

  // Group into weeks (7 per group) for display
  const weeks: typeof completions[] = [];
  for (let i = 0; i < completions.length; i += 7) {
    weeks.push(completions.slice(i, i + 7));
  }

  return (
    <div className="flex gap-[2px]" title="Last 8 weeks — click to toggle">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[2px]">
          {week.map((day, di) => (
            <button
              key={di}
              type="button"
              onClick={(e) => {
                if (onDayClick) {
                  e.preventDefault();
                  e.stopPropagation();
                  onDayClick(day.date);
                }
              }}
              disabled={!clickable}
              className={`w-[8px] h-[8px] rounded-[1.5px] transition-colors ${
                day.completed ? colors.on : colors.off
              } ${clickable && !day.completed ? colors.hover : ""} ${
                clickable ? "cursor-pointer" : ""
              }`}
              title={`${day.date}: ${day.completed ? "✓" : "—"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
