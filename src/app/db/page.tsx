import { getAllDbData } from "@/lib/db-views";
import Link from "next/link";
import DbTabs from "./DbTabs";

export const dynamic = "force-dynamic";

export default async function DbViewPage() {
  const data = await getAllDbData();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">Database View</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Raw data across all tables
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span>{data.themes.length} themes</span>
          <span>{data.goals.length} goals</span>
          <span>{data.systems.length} systems</span>
          <span>{data.dailyLogs.length} logs</span>
          <span>{data.systemCompletions.length} completions</span>
        </div>
      </div>

      <DbTabs data={data} />
    </div>
  );
}

