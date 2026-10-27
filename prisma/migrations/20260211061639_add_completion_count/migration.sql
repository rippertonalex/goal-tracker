-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SystemCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "count" INTEGER NOT NULL DEFAULT 0,
    "systemId" TEXT NOT NULL,
    "dailyLogId" TEXT NOT NULL,
    CONSTRAINT "SystemCompletion_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SystemCompletion_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SystemCompletion" ("completed", "dailyLogId", "id", "systemId") SELECT "completed", "dailyLogId", "id", "systemId" FROM "SystemCompletion";
DROP TABLE "SystemCompletion";
ALTER TABLE "new_SystemCompletion" RENAME TO "SystemCompletion";
CREATE UNIQUE INDEX "SystemCompletion_systemId_dailyLogId_key" ON "SystemCompletion"("systemId", "dailyLogId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
