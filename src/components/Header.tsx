"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
            ⚛
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Atomic Goals
            </h1>
            <p className="text-[10px] text-zinc-500 -mt-0.5 tracking-wider uppercase">
              Systems → Identity → Results
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/completed"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/50"
          >
            ✅ Completed
          </Link>
          <Link
            href="/db"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/50"
          >
            🗄️ DB View
          </Link>
          <div className="text-xs text-zinc-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

