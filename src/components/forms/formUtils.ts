export const inputClass =
  "w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600";

export const labelClass =
  "block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5";

export const primaryButtonClass =
  "rounded-lg bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50";

export const secondaryButtonClass =
  "rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200";

export function toDateInput(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
