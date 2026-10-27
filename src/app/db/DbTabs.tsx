"use client";

import { useState } from "react";

type TabName = "themes" | "goals" | "systems" | "dailyLogs" | "completions";

const tabs: { key: TabName; label: string; icon: string }[] = [
  { key: "themes", label: "Themes", icon: "🎯" },
  { key: "goals", label: "Goals", icon: "🏆" },
  { key: "systems", label: "Systems", icon: "⚙️" },
  { key: "dailyLogs", label: "Daily Logs", icon: "📅" },
  { key: "completions", label: "Completions", icon: "✅" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DbTabs({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState<TabName>("themes");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-zinc-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "text-white border-white"
                : "text-zinc-500 border-transparent hover:text-zinc-300"
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
            <span className="ml-2 text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-full">
              {tab.key === "themes"
                ? data.themes.length
                : tab.key === "goals"
                ? data.goals.length
                : tab.key === "systems"
                ? data.systems.length
                : tab.key === "dailyLogs"
                ? data.dailyLogs.length
                : data.systemCompletions.length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        {activeTab === "themes" && <ThemesTable rows={data.themes} />}
        {activeTab === "goals" && <GoalsTable rows={data.goals} />}
        {activeTab === "systems" && <SystemsTable rows={data.systems} />}
        {activeTab === "dailyLogs" && <DailyLogsTable rows={data.dailyLogs} />}
        {activeTab === "completions" && (
          <CompletionsTable rows={data.systemCompletions} />
        )}
      </div>
    </div>
  );
}

export default DbTabs;

// ─── Table Components ───

const thCls =
  "px-4 py-2.5 text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-900/80 whitespace-nowrap";
const tdCls = "px-4 py-2.5 text-sm text-zinc-300 whitespace-nowrap";
const tdMutedCls = "px-4 py-2.5 text-sm text-zinc-500 whitespace-nowrap";
const trCls = "border-t border-zinc-800/50 hover:bg-zinc-900/30 transition-colors";
const idCls =
  "px-4 py-2.5 text-[11px] font-mono text-zinc-600 whitespace-nowrap";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ThemesTable({ rows }: { rows: any[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className={thCls}>#</th>
          <th className={thCls}>ID</th>
          <th className={thCls}>Emoji</th>
          <th className={thCls}>Title</th>
          <th className={thCls}>Color</th>
          <th className={thCls}>Identity</th>
          <th className={thCls}>Created</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row: any) => (
          <tr key={row.id} className={trCls}>
            <td className={tdCls}>{row.number}</td>
            <td className={idCls}>{row.id}</td>
            <td className={tdCls}>{row.emoji}</td>
            <td className={tdCls}>{row.title}</td>
            <td className={tdCls}>
              <span
                className={`inline-block w-3 h-3 rounded-full mr-1.5 ${
                  row.color === "emerald"
                    ? "bg-emerald-400"
                    : row.color === "blue"
                    ? "bg-blue-400"
                    : row.color === "rose"
                    ? "bg-rose-400"
                    : row.color === "amber"
                    ? "bg-amber-400"
                    : "bg-purple-400"
                }`}
              />
              {row.color}
            </td>
            <td className={tdMutedCls}>
              <span className="max-w-[300px] truncate block">
                {row.identity || "—"}
              </span>
            </td>
            <td className={tdMutedCls}>
              {new Date(row.createdAt).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GoalsTable({ rows }: { rows: any[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className={thCls}>ID</th>
          <th className={thCls}>Theme</th>
          <th className={thCls}>Title</th>
          <th className={thCls}>Deadline</th>
          <th className={thCls}>Current</th>
          <th className={thCls}>Target</th>
          <th className={thCls}>Unit</th>
          <th className={thCls}>Notes</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row: any) => (
          <tr key={row.id} className={trCls}>
            <td className={idCls}>{row.id}</td>
            <td className={tdMutedCls}>{row.theme?.title ?? "—"}</td>
            <td className={tdCls}>{row.title}</td>
            <td className={tdCls}>
              {row.deadline
                ? new Date(row.deadline).toLocaleDateString()
                : "—"}
            </td>
            <td className={tdCls}>
              {row.currentValue != null ? row.currentValue : "—"}
            </td>
            <td className={tdCls}>
              {row.targetValue != null ? row.targetValue : "—"}
            </td>
            <td className={tdCls}>{row.unit || "—"}</td>
            <td className={tdMutedCls}>
              <span className="max-w-[200px] truncate block">
                {row.notes || "—"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SystemsTable({ rows }: { rows: any[] }) {
  const freqBadge: Record<string, string> = {
    daily: "text-emerald-400 bg-emerald-400/10",
    weekly: "text-blue-400 bg-blue-400/10",
    one_time: "text-orange-400 bg-orange-400/10",
    as_needed: "text-amber-400 bg-amber-400/10",
  };

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className={thCls}>ID</th>
          <th className={thCls}>Goal</th>
          <th className={thCls}>Description</th>
          <th className={thCls}>Frequency</th>
          <th className={thCls}>Deadline</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row: any) => (
          <tr key={row.id} className={trCls}>
            <td className={idCls}>{row.id}</td>
            <td className={tdMutedCls}>
              <span className="max-w-[200px] truncate block">
                {row.goal?.title ?? "—"}
              </span>
            </td>
            <td className={tdCls}>
              <span className="max-w-[300px] truncate block">
                {row.description}
              </span>
            </td>
            <td className={tdCls}>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  freqBadge[row.frequency] || "text-zinc-400 bg-zinc-800"
                }`}
              >
                {row.frequency}
              </span>
            </td>
            <td className={tdCls}>
              {row.deadline
                ? new Date(row.deadline).toLocaleDateString()
                : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DailyLogsTable({ rows }: { rows: any[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className={thCls}>ID</th>
          <th className={thCls}>Date</th>
          <th className={thCls}>Goal</th>
          <th className={thCls}>Notes</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-4 py-8 text-center text-zinc-600 text-sm">
              No daily logs yet — start checking off systems!
            </td>
          </tr>
        ) : (
          rows.map((row: any) => (
            <tr key={row.id} className={trCls}>
              <td className={idCls}>{row.id}</td>
              <td className={tdCls}>{row.date}</td>
              <td className={tdMutedCls}>{row.goal?.title ?? "—"}</td>
              <td className={tdMutedCls}>
                <span className="max-w-[200px] truncate block">
                  {row.notes || "—"}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CompletionsTable({ rows }: { rows: any[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className={thCls}>ID</th>
          <th className={thCls}>Date</th>
          <th className={thCls}>Goal</th>
          <th className={thCls}>System</th>
          <th className={thCls}>Completed</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-4 py-8 text-center text-zinc-600 text-sm">
              No completions yet — start checking off systems!
            </td>
          </tr>
        ) : (
          rows.map((row: any) => (
            <tr key={row.id} className={trCls}>
              <td className={idCls}>{row.id}</td>
              <td className={tdCls}>{row.dailyLog?.date ?? "—"}</td>
              <td className={tdMutedCls}>
                <span className="max-w-[150px] truncate block">
                  {row.dailyLog?.goal?.title ?? "—"}
                </span>
              </td>
              <td className={tdMutedCls}>
                <span className="max-w-[200px] truncate block">
                  {row.system?.description ?? "—"}
                </span>
              </td>
              <td className={tdCls}>
                {row.completed ? (
                  <span className="text-emerald-400">✓ Yes</span>
                ) : (
                  <span className="text-zinc-600">✗ No</span>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

