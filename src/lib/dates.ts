export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthName(month: number): string {
  const names = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return names[month];
}

export function getDayOfWeek(date: Date): number {
  return date.getDay(); // 0 = Sunday
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Generate array of dates for the last N months for heatmap */
export function getHeatmapDates(months: number = 6): Date[] {
  const today = new Date();
  const start = new Date(today);
  start.setMonth(start.getMonth() - months);
  // Align to start of week (Sunday)
  start.setDate(start.getDate() - start.getDay());

  const dates: Date[] = [];
  const current = new Date(start);
  while (current <= today) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function getWeeksArray(dates: Date[]): Date[][] {
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  for (const date of dates) {
    if (date.getDay() === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }
  return weeks;
}

