"use client";

import { System, SystemCompletion } from "@/lib/types";

interface SystemChecklistProps {
  systems: System[];
  completions: SystemCompletion[];
  onToggle: (systemId: string) => void;
  goalColor: string;
  readonly?: boolean;
}

const checkColors: Record<string, { checked: string; ring: string }> = {
  emerald: { checked: "bg-emerald-500", ring: "border-emerald-500/40" },
  blue: { checked: "bg-blue-500", ring: "border-blue-500/40" },
  rose: { checked: "bg-rose-500", ring: "border-rose-500/40" },
  amber: { checked: "bg-amber-500", ring: "border-amber-500/40" },
  purple: { checked: "bg-purple-500", ring: "border-purple-500/40" },
};

const frequencyLabel: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  as_needed: "As Needed",
};

const frequencyColor: Record<string, string> = {
  daily: "text-emerald-400/70 bg-emerald-400/10",
  weekly: "text-blue-400/70 bg-blue-400/10",
  as_needed: "text-amber-400/70 bg-amber-400/10",
};

export default function SystemChecklist({
  systems,
  completions,
  onToggle,
  goalColor,
  readonly = false,
}: SystemChecklistProps) {
  const colors = checkColors[goalColor] || checkColors.emerald;

  const isCompleted = (systemId: string): boolean => {
    const c = completions.find((comp) => comp.systemId === systemId);
    return c?.completed ?? false;
  };

  const completedCount = systems.filter((s) => isCompleted(s.id)).length;
  const totalCount = systems.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
          Systems
        </h3>
        <span className="text-xs text-zinc-500">
          {completedCount}/{totalCount} completed
        </span>
      </div>

      <div className="space-y-2">
        {systems.map((system) => {
          const completed = isCompleted(system.id);
          return (
            <button
              key={system.id}
              onClick={() => !readonly && onToggle(system.id)}
              disabled={readonly}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                completed
                  ? "border-white/5 bg-white/[0.02]"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
              } ${readonly ? "cursor-default" : "cursor-pointer"}`}
            >
              {/* Checkbox */}
              <div
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                  completed
                    ? `${colors.checked} border-transparent`
                    : `border-zinc-600`
                }`}
              >
                {completed && (
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

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-relaxed transition-all ${
                    completed ? "text-zinc-500 line-through" : "text-zinc-200"
                  }`}
                >
                  {system.description}
                </p>
                <span
                  className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium ${frequencyColor[system.frequency]}`}
                >
                  {frequencyLabel[system.frequency]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
