import { getDashboardData } from "@/lib/actions";
import ThemeDashboard from "@/components/ThemeDashboard";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const themes = await getDashboardData();

  // Flatten all systems for stats
  const allSystems = themes.flatMap((t) =>
    t.goals.flatMap((g) => g.systems)
  );

  const dailySystems = allSystems.filter((s) => s.frequency === "daily");
  const weeklySystems = allSystems.filter((s) => s.frequency === "weekly");
  const oneTimeSystems = allSystems.filter((s) => s.frequency === "one_time");

  const totalGoals = themes.reduce((s, t) => s + t.goals.length, 0);
  const dailyDone = dailySystems.filter((s) => s.completedThisPeriod).length;
  const weeklyDone = weeklySystems.filter((s) => s.completedThisPeriod).length;
  const oneTimeDone = oneTimeSystems.filter((s) => s.completedThisPeriod).length;

  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Atomic Goals</h2>
        <p className="text-zinc-400 text-base max-w-2xl">
          You do not rise to the level of your goals. You fall to the level of
          your systems.{" "}
          <span className="text-zinc-500">— James Clear</span>
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-5 gap-3 mb-10">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{totalGoals}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Goals</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{allSystems.length}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Systems</div>
        </div>
        {dailySystems.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white">
                {dailyDone}/{dailySystems.length}
              </span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Daily
            </div>
            {/* Mini progress bar */}
            <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  dailyDone === dailySystems.length
                    ? "bg-emerald-400"
                    : "bg-emerald-400/60"
                }`}
                style={{
                  width: `${Math.round(
                    (dailyDone / dailySystems.length) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
        {weeklySystems.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white">
                {weeklyDone}/{weeklySystems.length}
              </span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Weekly
            </div>
            <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  weeklyDone === weeklySystems.length
                    ? "bg-blue-400"
                    : "bg-blue-400/60"
                }`}
                style={{
                  width: `${Math.round(
                    (weeklyDone / weeklySystems.length) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
        {oneTimeSystems.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white">
                {oneTimeDone}/{oneTimeSystems.length}
              </span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              One-time
            </div>
            <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  oneTimeDone === oneTimeSystems.length
                    ? "bg-orange-400"
                    : "bg-orange-400/60"
                }`}
                style={{
                  width: `${Math.round(
                    (oneTimeDone / oneTimeSystems.length) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Themes with goals and systems */}
      {themes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg mb-2">No themes yet</p>
          <p className="text-zinc-600 text-sm">
            Run{" "}
            <code className="text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
              npx prisma db seed
            </code>{" "}
            to get started
          </p>
        </div>
      ) : (
        <ThemeDashboard themes={themes} />
      )}

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-zinc-600 text-sm italic">
          &ldquo;Every action you take is a vote for the type of person you wish
          to become.&rdquo;
        </p>
        </div>
    </div>
  );
}
