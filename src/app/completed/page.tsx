import Link from "next/link";
import { getCompletedData } from "@/lib/actions";
import CompletedClient from "./CompletedClient";

export const dynamic = "force-dynamic";

export default async function CompletedPage() {
  const themes = await getCompletedData();
  const completedGoalsCount = themes.reduce(
    (sum, theme) => sum + theme.completedGoals.length,
    0
  );
  const completedSystemsCount = themes.reduce(
    (sum, theme) => sum + theme.completedSystems.length,
    0
  );

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-3"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-white">Completed</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {completedGoalsCount} completed goals and {completedSystemsCount}{" "}
          completed systems grouped by theme.
        </p>
      </div>

      <CompletedClient themes={themes} />
    </div>
  );
}
