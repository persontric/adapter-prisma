/*
  Warnings:

  - You are about to drop the column `expires` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `person_id` on the `Session` table. All the data in the column will be lost.
  - Added the required column `expire_dts` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `person_id` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "person_id" TEXT NOT NULL,
    "expire_dts" DATETIME NOT NULL,
    "country" TEXT NOT NULL,
    CONSTRAINT "Session_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("country", "id") SELECT "country", "id" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_id_key" ON "Session"("id");
CREATE INDEX "Session_person_id_idx" ON "Session"("person_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
