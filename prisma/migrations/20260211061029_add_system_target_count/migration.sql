-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_System" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "deadline" DATETIME,
    "targetCount" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "System_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_System" ("deadline", "description", "frequency", "goalId", "id") SELECT "deadline", "description", "frequency", "goalId", "id" FROM "System";
DROP TABLE "System";
ALTER TABLE "new_System" RENAME TO "System";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
