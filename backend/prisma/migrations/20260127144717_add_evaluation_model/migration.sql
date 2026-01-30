-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "tutoringId" TEXT,
    "weekDate" DATETIME NOT NULL,
    "behavior" TEXT NOT NULL,
    "participation" TEXT NOT NULL,
    "progress" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "evaluations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "evaluations_tutoringId_fkey" FOREIGN KEY ("tutoringId") REFERENCES "tutorings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
